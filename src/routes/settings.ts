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
} from "../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
} from "../utilites/index.js";
import { compare, hash } from "bcrypt";

import { auth } from "../middleware/auth.js";

const SettingsRoute = express.Router();

SettingsRoute.use(auth());

SettingsRoute.put(
    "/password",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let body = req.body ?? {};

        if (!body.oldPassword) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.OldPasswordMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.newPassword) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.NewPasswordMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let user = await prismaClient.users.findFirst({
            where: {
                id: userId,
            },
            select: {
                id: true,
                password: true,
                isActive: true,
                isDeleted: true,
            },
        });

        if (!user) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!user.isActive || user.isDeleted) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserUnavailable,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let validPassword = await compare(body.oldPassword, user.password);

        if (!validPassword) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.IncorrectPassword,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let hashedPassword = await hash(body.newPassword, kDefaultSaltRounds);

        await prismaClient.users.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
            select: { id: true },
        });

        res.status(200).json(
            sendResponse(true, kDefaultSuccessMessage, null, undefined),
        );
    }),
);

export default SettingsRoute;
