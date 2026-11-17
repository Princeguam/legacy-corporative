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
} from "../../../../constants/index.js";
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
} from "../../../../utilites/index.js";
import humps from "humps";
import { addDays, endOfMonth, startOfMonth } from "date-fns";

const AdminTransactionIDRoute = express.Router();

AdminTransactionIDRoute.get(
    "/:transactionId",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let transactionId = toId(req.params.transactionId);

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

AdminTransactionIDRoute.put(
    "/:transactionId",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let transactionId = toId(req.params.transactionId);
        let now = new Date();

        let body = req.body;

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
                reviewedById: userId,
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

export default AdminTransactionIDRoute;
