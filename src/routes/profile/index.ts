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

const ProfileRoute = express.Router();

ProfileRoute.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: userId,
                role: userRole,
            },
            select: $Types.users,
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (userExist.isDeleted) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserDeactivated,
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

ProfileRoute.put(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let body = req.body ?? {};

        let user = await prismaClient.users.findFirst({
            where: {
                id: userId,
                role: userRole,
            },
            select: $Types.users,
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

        if (user.isDeleted) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserDeactivated,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (body.email) {
            let emailExist = await prismaClient.users.findFirst({
                where: {
                    id: {
                        not: userId,
                    },
                    email: body.email,
                },
                select: { id: true },
            });

            if (emailExist) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.EmailAlreadyExist,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }
        }

        if (body.phoneNo) {
            let phoneExist = await prismaClient.users.findFirst({
                where: {
                    id: {
                        not: userId,
                    },
                    phoneNo: body.phoneNo,
                },
            });

            if (phoneExist) {
                let { statusCode, message, errorCode } = HandleServerError(
                    ErrorType.PhoneNoAlreadyExist,
                );
                res.status(statusCode).json(
                    sendResponse(false, message, undefined, errorCode),
                );
                return;
            }
        }

        let fullName = `${body.firstName ? body.firstName : user.firstName} ${body.lastName ? body.lastName : user.lastName} ${body.middleName ? body.middleName : user.middleName}`;
        let updated = await prismaClient.users.update({
            where: {
                id: userId,
            },
            data: {
                firstName: body.firstName || user.firstName,
                middleName: body.middleName || user.middleName,
                lastName: body.lastName || user.lastName,
                fullName: fullName,
                email: body.email || user.email,
                phoneNo: body.phoneNo || user.phoneNo,
                dob: body.dob ? new Date(body.dob) : user.dob,
                address: body.address ?? user.address,
                state: body.state || user.state,
                lga: body.lga || user.lga,
                gender: body.gender || user.gender,
                passport: body.passport || user.passport,
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

ProfileRoute.delete(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let user = await prismaClient.users.findFirst({
            where: {
                id: userId,
                role: userRole,
            },
            select: $Types.users,
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

        if (user.isDeleted) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.UserDeactivated,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        await prismaClient.users.update({
            where: {
                id: userId,
            },
            data: {
                isDeleted: true,
            },
        });

        res.status(200).json(
            sendResponse(true, kDefaultSuccessMessage, null, undefined),
        );
    }),
);

export default ProfileRoute;
