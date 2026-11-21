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

        if (body.images !== undefined && !Array.isArray(body.images)) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.InvalidInput,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let images = body.images;

        let transact = await prismaClient.$transaction(async (tx) => {
            let feedback = await tx.feedbacks.create({
                data: {
                    subject: body.subject,
                    message: body.message,
                    category: body.category,
                    userId: userId,
                },
                select: { id: true },
            });

            await tx.feedbackImages.createMany({
                data: images.map((i: any, index: any) => ({
                    imageUrl: i,
                    feedbackId: feedback.id,
                    caption: `Image ${index}`,
                })),
            });

            return await tx.feedbacks.findFirst({
                where: {
                    id: feedback.id,
                },
                select: $Types.feedback,
            });
        });

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(transact),
                undefined,
            ),
        );
    }),
);

export default FeedbackRoute;
