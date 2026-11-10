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
} from "../../constants/index.js";
import { sendResponse } from "../../utilites/sendResponse.js";
import { prismaClient } from "../../utilites/prismaClient.js";
import bcrypt from "bcrypt";
import humps from "humps";
import { addDays } from "date-fns";
import { generatJwtToken } from "../../utilites/index.js";
import { $Enums } from "../../constants/enums.js";

const LoginRoute = express.Router();

LoginRoute.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let body = req.body ?? {};

        if (!body.email) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.EmailMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.password) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PasswordMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                email: body.email,
            },
            select: {
                ...$Types.users,
                password: true,
            },
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.IncorrectPassword,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let validPassword = await bcrypt.compare(
            body.password,
            userExist.password,
        );

        if (!validPassword) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.IncorrectPassword,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let now = new Date();
        let accessTokenExpiration = addDays(now, kDefaultAccessTokenExpiration);
        let refreshTokenExpiration = addDays(
            now,
            kDefaultRefreshTokenExpiration,
        );

        let accessToken = generatJwtToken(
            JSON.stringify({
                userId: userExist.id,
                userRole: userExist.role,
                expiration: accessTokenExpiration.getTime(),
            }),
            kDefaultAccessTokenExpirationIn,
        );

        let refreshToken = generatJwtToken(
            JSON.stringify({
                userId: userExist.id,
                userRole: userExist.role,
                expiresAt: refreshTokenExpiration.getTime(),
                isRefreshToken: true,
            }),
            kDefaultRefreshTokenExpirationIn,
        );

        await prismaClient.userSessions.create({
            data: {
                userId: userExist.id,
                refreshToken: refreshToken,
                expiration: refreshTokenExpiration,
                role: $Enums.UserRole.User,
            },
        });

        let { password, ...payload } = userExist;

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys({
                    ...payload,
                    accessToken,
                    refreshToken,
                    expiresAt: accessTokenExpiration.getTime(),
                }),
                undefined,
            ),
        );
    }),
);

export default LoginRoute;
