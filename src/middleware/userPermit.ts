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

export function userPermit() {
    return asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const allowedRoles = [$Enums.UserRole.Admin];
            const userRole = req.store.get(kUserRoleStoreKey);

            if (!userRole) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.UserUnavailable,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }

            if (!allowedRoles.includes(userRole)) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.NotAuthorized,
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
