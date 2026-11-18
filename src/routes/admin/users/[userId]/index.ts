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
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
    toId,
} from "../../../../utilites/index.js";
import humps from "humps";
import AdminUserIDTransactionRoute from "./transaction/index.js";

const AdminUserIDRoute = express.Router();

AdminUserIDRoute.get(
    "/:memberId",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let memberId = toId(req.params.memberId);

        if (!memberId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: memberId,
            },
            select: $Types.users,
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberNotFound,
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
    "/:memberId/deactivate",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let memberId = toId(req.params.memberId);

        let body = req.body ?? {};

        if (!memberId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let userExist = await prismaClient.users.findFirst({
            where: {
                id: memberId,
            },
            select: $Types.users,
        });

        if (!userExist) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MemberNotFound,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let isActive = body.isActive ? true : false;

        let updated = await prismaClient.users.update({
            where: {
                id: memberId,
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
    "/:memberId/admin",
    asyncHandler(async (req: Request, res: Response) => {
        let adminId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
        let memberId = toId(req.params.memberId);

        let body = req.body ?? {};

        if (!memberId) {
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
                id: memberId,
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
                id: memberId,
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

AdminUserIDRoute.use("/", AdminUserIDTransactionRoute);

export default AdminUserIDRoute;
