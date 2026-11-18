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
    toId,
} from "../../../utilites/index.js";
import bcrypt from "bcrypt";
import humps from "humps";
import { addDays, endOfMonth, startOfMonth } from "date-fns";
import { is } from "date-fns/locale";

const NotificationIDRoute = express.Router();

NotificationIDRoute.get(
    "/:notificationId",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let notificationId = toId(req.params.notificationId);

        if (!notificationId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.NotificationIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let notification = await prismaClient.notifications.findFirst({
            where: {
                id: notificationId,
                userId: userId,
            },
            select: $Types.notifications,
        });

        if (!notification) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.NotificationNotFound,
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
                humps.camelizeKeys(notification),
                undefined,
            ),
        );
    }),
);

NotificationIDRoute.put(
    "/:notificationId",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let notificationId = toId(req.params.notificationId);
        let now = new Date();
        let body = req.query;

        if (!notificationId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.NotificationIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let notification = await prismaClient.notifications.findFirst({
            where: {
                id: notificationId,
                userId: userId,
            },
            select: $Types.notifications,
        });

        if (!notification) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.NotificationNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let isRead = body.isRead ? true : false;

        await prismaClient.notifications.update({
            where: {
                id: notificationId,
            },
            data: {
                readAt: isRead ? now : null,
            },
        });

        res.status(200).json(
            sendResponse(true, kDefaultSuccessMessage, null, undefined),
        );
    }),
);

export default NotificationIDRoute;
