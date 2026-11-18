import express, { type Response, type Request } from "express";
import asyncHandler from "express-async-handler";
import {
    kDefaultAccessTokenExpirationIn,
    kDefaultRefreshTokenExpirationIn,
    kDefaultSuccessMessage,
    kUserIdStoreKey,
    kUserRoleStoreKey,
    HandleServerError,
    ErrorType,
    kDefaultAccessTokenExpiration,
    kDefaultRefreshTokenExpiration,
    $Types,
    kDefaultQueryPage,
    kDefaultQueryCount,
    kDefaultSearchQuery,
    kDefaultMaxQueryCount,
    $Enums,
    kDefaultAllQueryPage,
} from "../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
} from "../../utilites/index.js";
import bcrypt from "bcrypt";
import humps from "humps";
import { addDays, endOfMonth, startOfMonth } from "date-fns";
import TransactionIDRoute from "./[transactionId]/index.js";
import { auth } from "../../middleware/index.js";

type ArrangeBy = "status" | "created" | "note";

type ArrangeOrder = "asc" | "desc";

const TransactionRoute = express.Router();

TransactionRoute.use(auth());

TransactionRoute.get(
    "/all",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let url = new URL(req.url || String(), `http://${req.headers.host}`);

        let search = url.searchParams.get("search") || kDefaultSearchQuery;

        let page = Number(url.searchParams.get("page") ?? kDefaultQueryPage);
        page = !isNaN(page) ? page : kDefaultQueryPage;

        let count = Number(url.searchParams.get("count") ?? kDefaultQueryCount);
        count = !isNaN(count) ? count : kDefaultQueryCount;
        count = Math.min(Math.max(0, count), kDefaultMaxQueryCount);

        let getAllRecord =
            url.searchParams.get("all") && parseBoolean(req.query.all);

        let searchOrderBy: ArrangeBy = "created";
        if (url.searchParams.has("by")) {
            let searchParamValue = url.searchParams.get("by") || "";
            searchOrderBy = ["status", "created", "note"].includes(
                searchParamValue,
            )
                ? (searchParamValue as ArrangeBy)
                : "created";
        }

        let searchOrder: ArrangeOrder = "desc";
        if (url.searchParams.has("order")) {
            let searchParamValue = url.searchParams.get("order") || "";
            searchOrder = ["asc", "desc"].includes(searchParamValue)
                ? (searchParamValue as ArrangeOrder)
                : "desc";
        }

        let orderBy = {
            [searchOrderBy]: searchOrder,
        };

        let whereClause: Prisma.PaymentTransactionsFindManyArgs["where"] = {
            userId: userId,
        };

        let [totalItems, transactions] = await prismaClient.$transaction([
            prismaClient.paymentTransactions.count({ where: whereClause }),
            prismaClient.paymentTransactions.findMany({
                where: whereClause,
                ...(!getAllRecord && {
                    skip: getSkippedPrismaValue(page, count),
                    take: count,
                }),
                orderBy,
                select: $Types.paymentTransactions,
            }),
        ]);

        let pageData = humps.camelizeKeys(transactions);

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                {
                    page: !getAllRecord ? page : kDefaultAllQueryPage,
                    count: pageData.length,
                    totalPages: !getAllRecord
                        ? Math.ceil(totalItems / count)
                        : kDefaultAllQueryPage,
                    totalItems: totalItems,
                    pageData,
                },
                undefined,
            ),
        );
    }),
);

TransactionRoute.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let now = new Date();

        let body = req.body ?? {};

        if (!body.amount) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.AmountMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }
        if (!body.bankAccountId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.BankAccountIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.attachmentUrl) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.AttachementMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.period) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentPeriodMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let amount = parseMoneyAmount(body.amount, 0n);
        if (!amount) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.InvalidInput,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let period = startOfMonth(new Date(body.period));
        let start = period;
        let end = endOfMonth(new Date(period));
        let bankAccountId = parseInt(body.bankAccountId);

        let bankAccount = await prismaClient.bankAcconts.findFirst({
            where: {
                id: bankAccountId,
            },
            select: { id: true },
        });

        if (!bankAccount) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.BankAccountNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let paymentExist = await prismaClient.paymentTransactions.findFirst({
            where: {
                userId: userId,
                period: {
                    gte: start,
                    lte: end,
                },
            },
            select: { id: true, status: true },
        });

        if (paymentExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentAlreadyExist,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let newPayment = await prismaClient.paymentTransactions.create({
            data: {
                bankAccountId: bankAccountId,
                userId: userId,
                status: $Enums.TransactionStatus.PENDING,
                type: $Enums.TransactionType.DEPOSIT,
                amount: amount,
                note: body.note,
                source: $Enums.TransactionSource.User,
                attachmentUrl: body.attachmentUrl,
                period: period,
                depositedAt: body.depositedAt
                    ? new Date(body.depositedAt)
                    : now,
            },
            select: $Types.paymentTransactions,
        });

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(newPayment),
                undefined,
            ),
        );
    }),
);

TransactionRoute.delete(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let body = req.body ?? {};

        body.transactionIds = body.transactionIds ?? [];

        let deleted = await prismaClient.paymentTransactions.deleteMany({
            where: {
                userId: userId,
                id: {
                    in: body.transactionIds,
                },
            },
        });

        console.log(deleted);

        res.status(200).json(
            sendResponse(true, kDefaultSuccessMessage, deleted, undefined),
        );
    }),
);

TransactionRoute.use("/", TransactionIDRoute);

export default TransactionRoute;
