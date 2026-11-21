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
    kDefaultSaltRounds,
} from "../../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    toId,
} from "../../../utilites/index.js";
import bcrypt from "bcrypt";
import humps from "humps";
import { addDays } from "date-fns";
import { auth } from "../../../middleware/index.js";

const AdminBankAccountRoute = express.Router();

type ArrangeBy = "bankName" | "accountName" | "accountNumber" | "createdAt";

type ArrangeOrder = "asc" | "desc";

type QueryOrderByObject = Partial<Record<ArrangeBy, ArrangeOrder>>;

AdminBankAccountRoute.get(
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

        let isActive = parseBoolean(req.query.isActive);

        let getAllRecord =
            url.searchParams.get("all") && parseBoolean(req.query.all);

        let searchOrderBy: ArrangeBy = "createdAt";
        if (url.searchParams.has("by")) {
            let searchParamValue = url.searchParams.get("by") || "";
            searchOrderBy = [
                "bankName",
                "accountName",
                "acountNumber",
                "createdAt",
            ].includes(searchParamValue)
                ? (searchParamValue as ArrangeBy)
                : "createdAt";
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

        let whereClause: Prisma.BankAccontsFindManyArgs["where"] = {
            OR: [
                {
                    bankName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    accountName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    accountNumber: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        };

        if (isActive !== undefined && typeof isActive === "boolean") {
            whereClause.isActive = isActive;
        }

        let [totalItems, banks] = await prismaClient.$transaction([
            prismaClient.bankAcconts.count({ where: whereClause }),
            prismaClient.bankAcconts.findMany({
                where: whereClause,
                ...(!getAllRecord && {
                    skip: getSkippedPrismaValue(page, count),
                    take: count,
                }),
                orderBy,
                select: $Types.bankAccount,
            }),
        ]);

        let pageData = humps.camelizeKeys(banks);

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

AdminBankAccountRoute.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let body = req.body ?? {};

        if (!body.bankName) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.BankNameMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.accountName) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.BankAccountNameMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.accountNumber) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.BankAccountNumberMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let bankExist = await prismaClient.bankAcconts.findFirst({
            where: {
                accountNumber: body.accountNumber,
            },
            select: { id: true },
        });

        if (bankExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.BankAccountAlreadyExist,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let newBank = await prismaClient.bankAcconts.create({
            data: {
                bankName: body.bankName,
                accountName: body.accountName,
                accountNumber: body.accountNumber,
            },
            select: $Types.bankAccount,
        });

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(newBank),
                undefined,
            ),
        );
    }),
);

AdminBankAccountRoute.put(
    "/:bankId",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let bankId = toId(req.params.bankId);

        let body = req.body ?? {};

        let isActive = parseBoolean(body.isActive) ? true : false;

        if (!bankId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.BankAccountIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let bankExist = await prismaClient.bankAcconts.findFirst({
            where: {
                id: bankId,
            },
            select: $Types.bankAccount,
        });

        if (!bankExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.BankAccountNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (body.accountNumber) {
            let accountExist = await prismaClient.bankAcconts.findFirst({
                where: {
                    id: {
                        not: bankId,
                    },
                    accountNumber: body.accountNumber,
                },
            });

            if (accountExist) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.BankAccountNumberAlreadyExist,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }
        }

        let updated = await prismaClient.bankAcconts.update({
            where: {
                id: bankId,
            },
            data: {
                bankName: body.bankName ?? bankExist.bankName,
                accountName: body.accountName ?? bankExist.accountName,
                accountNumber: body.accountNumber ?? bankExist.accountNumber,
                isActive: isActive,
            },
            select: $Types.bankAccount,
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

export default AdminBankAccountRoute;
