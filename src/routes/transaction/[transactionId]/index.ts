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
} from "../../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
} from "../../../utilites/index.js";
import bcrypt from "bcrypt";
import humps from "humps";
import { addDays, endOfMonth, startOfMonth } from "date-fns";

const TransactionIDRoute = express.Router();

TransactionIDRoute.get(
    "/:transactionId",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let transactionId = parseInt(String(req.params.transactionId));

        if (!transactionId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let paymentExist = await prismaClient.paymentTransactions.findFirst({
            where: {
                id: transactionId,
                userId: userId,
            },
            select: $Types.paymentTransactions,
        });

        if (!paymentExist) {
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
                humps.camelizeKeys(paymentExist),
                undefined,
            ),
        );
    }),
);

TransactionIDRoute.put(
    "/:transactionId",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let transactionId = parseInt(String(req.params.transactionId));

        let body = req.body ?? {};

        if (!transactionId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let paymentExist = await prismaClient.paymentTransactions.findFirst({
            where: {
                id: transactionId,
                userId: userId,
            },
            select: $Types.paymentTransactions,
        });

        if (!paymentExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (
            paymentExist.status !== $Enums.TransactionStatus.PENDING ||
            paymentExist.reviewedById
        ) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentUpdateConflict,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }
        let period;

        if (body.period) {
            period = startOfMonth(new Date(body.period));
            let start = period;
            let end = endOfMonth(new Date(body.period));

            let paymentPeriodExist =
                await prismaClient.paymentTransactions.findFirst({
                    where: {
                        id: transactionId,
                        userId: userId,
                        period: {
                            gte: start,
                            lte: end,
                        },
                    },
                });

            if (paymentPeriodExist) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.PaymentAlreadyExist,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }
        }

        let amount;
        if (body.amount) {
            amount = parseMoneyAmount(body.amount);
            if (!amount) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.AmountMissing,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }
        }

        let updated = await prismaClient.paymentTransactions.update({
            where: {
                id: transactionId,
            },
            data: {
                amount: amount ?? paymentExist.amount,
                note: body.note ?? paymentExist.note,
                attachmentUrl: body.attachmentUrl ?? paymentExist.attachmentUrl,
                period: period ?? paymentExist.period,
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

export default TransactionIDRoute;
