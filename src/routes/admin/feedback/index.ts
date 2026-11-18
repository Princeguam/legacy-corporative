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
} from "../..../../../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
    toId,
    parseDateRangeValue,
    parseEnumList,
} from "../../../utilites/index.js";
import humps from "humps";
import { auth } from "../../../middleware/auth.js";

const AdminFeedbackRoute = express.Router();

type ArrangeBy = "subject" | "message" | "category" | "created";

type ArrangeOrder = "asc" | "desc";

type QueryOrderByObject = Partial<Record<ArrangeBy, ArrangeOrder>>;

AdminFeedbackRoute.get(
    "/all",
    asyncHandler(async (req: Request, res: Response) => {
        let url = new URL(req.url || String(), `http://${req.headers.host}`);

        let search = url.searchParams.get("search") || kDefaultSearchQuery;

        let page = Number(url.searchParams.get("page") ?? kDefaultQueryPage);
        page = !isNaN(page) ? page : kDefaultQueryPage;

        let count = Number(url.searchParams.get("count") ?? kDefaultQueryCount);
        count = !isNaN(count) ? count : kDefaultQueryCount;
        count = Math.min(Math.max(0, count), kDefaultMaxQueryCount);

        let getAllRecord =
            url.searchParams.get("all") && parseBoolean(req.query.all);

        let from = parseDateRangeValue(String(req.query.from));
        let to = parseDateRangeValue(String(req.query.to), true);
        if (from && to && from > to) {
            from = undefined;
            to = undefined;
        }

        let category = Object.values($Enums.FeedbackCategory);
        let selectedCategory = parseEnumList(
            String(req.query.status),
            category,
        );

        let searchOrderBy: ArrangeBy = "created";
        if (url.searchParams.has("by")) {
            let searchParamValue = url.searchParams.get("by") || "";
            searchOrderBy = ["subject", "message"].includes(searchParamValue)
                ? (searchParamValue as ArrangeBy)
                : "created";
        }

        let searchOrder: ArrangeOrder = "desc";
        if (url.searchParams.has("order")) {
            let searchParamValue = url.searchParams.get("order") || "";
            searchOrder = ["asc", "desc"].includes(searchParamValue)
                ? (searchParamValue as ArrangeOrder)
                : "desc";
        }

        let orderBy: QueryOrderByObject = {
            [searchOrderBy]: searchOrder,
        };

        let whereClause: Prisma.FeedbacksFindManyArgs["where"] = {};

        if (from || to) {
            whereClause.created = {};
            if (from) whereClause.created.gte = from;
            if (to) whereClause.created.lte = to;
        }
        if (selectedCategory.length > 0) {
            whereClause.category = { in: category };
        }

        if (search) {
            let matchingCategory = category.filter((cat) =>
                cat.toLowerCase().includes(search.toLowerCase()),
            );
            whereClause.OR = [
                {
                    subject: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    message: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];

            if (matchingCategory.length > 0) {
                whereClause.OR.push({ category: { in: matchingCategory } });
            }
        }

        let [totalItems, feedbacks] = await prismaClient.$transaction([
            prismaClient.feedbacks.count({ where: whereClause }),
            prismaClient.feedbacks.findMany({
                where: whereClause,
                ...(!getAllRecord && {
                    skip: getSkippedPrismaValue(page, count),
                    take: count,
                }),
                orderBy,
                select: $Types.feedback,
            }),
        ]);

        let pageData = humps.camelizeKeys(feedbacks);

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                {
                    page: !getAllRecord ? page : kDefaultAllQueryPage,
                    count: pageData.length,
                    totalPages: !getAllRecord
                        ? Math.ceil(totalItems / count)
                        : kDefaultAllQueryPage,
                    totalItems: totalItems,
                    pageData,
                },
                undefined,
            ),
        );
    }),
);

AdminFeedbackRoute.get(
    "/:feedbackId",
    asyncHandler(async (req: Request, res: Response) => {
        let feedbackId = toId(req.params.feedbackId);

        if (!feedbackId) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.FeedbackIDMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let feedback = await prismaClient.feedbacks.findFirst({
            where: {
                id: feedbackId,
            },
            select: $Types.feedback,
        });

        if (!feedback) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.FeedbackNotFound,
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
                humps.camelizeKeys(feedback),
                undefined,
            ),
        );
    }),
);

export default AdminFeedbackRoute;
