import express, { type Response, type Request } from "express";
import asyncHandler from "express-async-handler";
import {
    kDefaultSuccessMessage,
    kUserIdStoreKey,
    kUserRoleStoreKey,
    HandleServerError,
    ErrorType,
    $Types,
    kDefaultQueryPage,
    kDefaultQueryCount,
    kDefaultSearchQuery,
    kDefaultMaxQueryCount,
    $Enums,
    kDefaultAllQueryPage,
} from "../../../../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
    parseDateRangeValue,
    parseEnumList,
    toId,
} from "../../../../../utilites/index.js";
import humps from "humps";
import { addDays, endOfMonth, startOfMonth } from "date-fns";

const AdminUserIDTransactionRoute = express.Router();

type ArrangeBy = "status" | "created";

type ArrangeOrder = "asc" | "desc";

type QueryOrderByObject = Partial<Record<ArrangeBy, ArrangeOrder>>;

AdminUserIDTransactionRoute.get(
    "/:memberId/transaction/all",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let memberId = toId(req.params.memberId);

        if (!memberId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: memberId,
            },
            select: $Types.users,
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }
        let url = new URL(req.url || String(), `http://${req.headers.host}`);

        let search = url.searchParams.get("search") || kDefaultSearchQuery;

        let page = Number(url.searchParams.get("page") ?? kDefaultQueryPage);
        page = !isNaN(page) ? page : kDefaultQueryPage;

        let count = Number(url.searchParams.get("count") ?? kDefaultQueryCount);
        count = !isNaN(count) ? count : kDefaultQueryCount;
        count = Math.min(Math.max(0, count), kDefaultMaxQueryCount);

        let isActive = parseBoolean(req.query.isActive);

        let getAllRecord =
            url.searchParams.get("all") && parseBoolean(req.query.all);

        let from = parseDateRangeValue(String(req.query.from));
        let to = parseDateRangeValue(String(req.query.to), true);
        if (from && to && from > to) {
            from = undefined;
            to = undefined;
        }

        let statuses = Object.values($Enums.TransactionStatus);
        let selectedStatuses = parseEnumList(
            String(req.query.status),
            statuses,
        );

        let searchOrderBy: ArrangeBy = "created";
        if (url.searchParams.has("by")) {
            let searchParamValue = url.searchParams.get("by") || "";
            searchOrderBy = ["status", "address"].includes(searchParamValue)
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

        let orderBy: QueryOrderByObject = {
            [searchOrderBy]: searchOrder,
        };

        let whereClause: Prisma.PaymentTransactionsFindManyArgs["where"] = {
            userId: memberId,
        };

        if (from || to) {
            whereClause.period = {};
            if (from) whereClause.period.gte = from;
            if (to) whereClause.period.lte = to;
        }
        if (selectedStatuses.length > 0) {
            whereClause.status = { in: selectedStatuses };
        }

        if (search) {
            let matchingStatuses = statuses.filter((status) =>
                status.toLowerCase().includes(search.toLowerCase()),
            );
            whereClause.OR = [
                {
                    note: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];

            if (matchingStatuses.length > 0) {
                whereClause.OR.push({ status: { in: matchingStatuses } });
            }
        }

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

AdminUserIDTransactionRoute.get(
    "/:memberId/transaction/:transactionId",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let memberId = toId(req.params.memberId);
        let transactionId = toId(req.params.transactionId);

        if (!memberId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: memberId,
            },
            select: $Types.users,
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!transactionId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let transaction = await prismaClient.paymentTransactions.findFirst({
            where: {
                id: transactionId,
                userId: memberId,
            },
            select: $Types.paymentTransactions,
        });

        if (!transaction) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(transaction),
                undefined,
            ),
        );
    }),
);

AdminUserIDTransactionRoute.put(
    "/:memberId/transaction/:transactionId",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let memberId = toId(req.params.memberId);
        let transactionId = toId(req.params.transactionId);

        let body = req.body;
        let now = new Date();

        if (!memberId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: memberId,
            },
            select: $Types.users,
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!transactionId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let transaction = await prismaClient.paymentTransactions.findFirst({
            where: {
                id: transactionId,
                userId: memberId,
            },
            select: $Types.paymentTransactions,
        });

        if (!transaction) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }
        let isAccepted = parseBoolean(body.isAccepted) ? true : false;

        let updated = await prismaClient.paymentTransactions.update({
            where: {
                id: transactionId,
            },
            data: {
                status: isAccepted
                    ? $Enums.TransactionStatus.CONFIRMED
                    : $Enums.TransactionStatus.REJECTED,
                reviewedById: adminId,
                reviewedAt: now,
            },
            select: $Types.paymentTransactions,
        });

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(updated),
                undefined,
            ),
        );
    }),
);

export default AdminUserIDTransactionRoute;
