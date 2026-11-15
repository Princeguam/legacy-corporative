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
} from "../../../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
} from "../../../../utilites/index.js";
import bcrypt from "bcrypt";
import humps from "humps";
import { addDays, endOfMonth, startOfMonth } from "date-fns";
import { is } from "date-fns/locale";

const AdminUserIDRoute = express.Router();

AdminUserIDRoute.get(
    "/:userId",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let externalUserId = parseInt(String(req.params.userId));

        if (!externalUserId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: externalUserId,
            },
            select: $Types.users,
        });

        if (!userExist) {
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
                humps.camelizeKeys(userExist),
                undefined,
            ),
        );
    }),
);

AdminUserIDRoute.put(
    "/:userId/deactivate",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let externalUserId = parseInt(String(req.params.userId));

        let body = req.body ?? {};

        if (!externalUserId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: externalUserId,
            },
            select: $Types.users,
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let isActive = body.isActive ? true : false;

        let updated = await prismaClient.users.update({
            where: {
                id: externalUserId,
            },
            data: {
                isActive: isActive,
            },
            select: $Types.users,
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

AdminUserIDRoute.put(
    "/:userId/admin",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let externalUserId = parseInt(String(req.params.userId));

        let body = req.body ?? {};

        if (!externalUserId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: externalUserId,
            },
            select: $Types.users,
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PaymentNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let isAdmin = body.isAdmin ? true : false;

        let updated = await prismaClient.users.update({
            where: {
                id: externalUserId,
            },
            data: {
                isActive: isAdmin,
                role: $Enums.UserRole.Admin,
            },
            select: $Types.users,
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

export default AdminUserIDRoute;
