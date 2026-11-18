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
} from "../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
    toId,
} from "../../utilites/index.js";
import humps from "humps";
import { auth } from "../../middleware/auth.js";

const FeedbackRoute = express.Router();

FeedbackRoute.use(auth());

FeedbackRoute.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);

        let body = req.body ?? {};

        if (!body.message) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.MessageMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.subject) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.SubjectMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.category) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.CategoryMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let feedback = await prismaClient.feedbacks.create({
            data: {
                subject: body.subject,
                message: body.message,
                category: body.category,
                userId: userId,
            },
            select: $Types.feedback,
        });

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(feedback),
                undefined,
            ),
        );
    }),
);

export default FeedbackRoute;
