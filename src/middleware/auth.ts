import express, {
    type Response,
    type Request,
    type NextFunction,
} from "express";
import asyncHandler from "express-async-handler";
import {
    kUserIdStoreKey,
    kUserRoleStoreKey,
    kUserSessionIdStoreKey,
    $Enums,
} from "../constants/index.js";
import { ErrorType, HandleServerError } from "../constants/errors.js";
import {
    decodeJwtToken,
    sendResponse,
    prismaClient,
} from "../utilites/index.js";
import { isAfter, toDate } from "date-fns";

export function auth() {
    return asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const authHeader = req.headers.authorization;
            let now = new Date();

            if (!authHeader) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.AuthorizationMissing,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }

            let token = (authHeader && authHeader.split(" ")[1]) || undefined;

            if (!token) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.AuthorizationMissing,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }

            try {
                let decoded = decodeJwtToken(token);

                if (!decoded.value) {
                    throw new Error();
                }
                let { userId, expiresIn } = JSON.parse(decoded.value);

                if (!userId || !expiresIn) {
                    throw new Error();
                }
                if (isAfter(Date.now(), toDate(expiresIn))) {
                    let { statusCode, message, errorCode } = HandleServerError(
                        ErrorType.AuthorizationExpired,
                    );
                    res.status(statusCode).json(
                        sendResponse(false, message, undefined, errorCode),
                    );
                    return;
                }

                let session = await prismaClient.userSessions.findFirst({
                    where: {
                        userId: userId,
                        expiration: { gt: now },
                    },
                    select: {
                        id: true,
                        authType: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                role: true,
                                isDeleted: true,
                            },
                        },
                    },
                });

                if (!session) throw new Error();

                if (session.authType !== $Enums.AuthType.Api) throw new Error();

                if (session.user.isDeleted) throw new Error();

                req.store.set(kUserIdStoreKey, session.user.id);

                req.store.set(kUserSessionIdStoreKey, session.id);

                req.store.set(kUserRoleStoreKey, session.user.role);
            } catch (err: any) {
                console.error(err);

                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.AuthorizationInvalid,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }

            next();
        },
    );
}
