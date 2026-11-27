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

type ArrangeBy = "name" | "description" | "created";

type ArrangeOrder = "asc" | "desc";

interface DuesRequestBody {
    name: string;
    description: string;
    amount: bigint;
    dueDate: Date;
    isActive: boolean;
}

const AdminDuesRoute = express.Router();

AdminDuesRoute.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let url = new URL(req.url || String(), `http://${req.headers.host}`);

        let search = url.searchParams.get("search") || kDefaultSearchQuery;

        let page = Number(url.searchParams.get("page") ?? kDefaultQueryPage);
        page = !isNaN(page) ? page : kDefaultQueryPage;

        let count = Number(url.searchParams.get("count") ?? kDefaultQueryCount);
        count = !isNaN(count) ? count : kDefaultQueryCount;
        count = Math.min(Math.max(0, count), kDefaultMaxQueryCount);

        let isActive = parseBoolean(req.query.isActive);

        let getAllRecord =
            url.searchParams.get("all") && parseBoolean(req.query.all);

        let from = parseDateRangeValue(String(req.query.from));
        let to = parseDateRangeValue(String(req.query.to), true);
        if (from && to && from > to) {
            from = undefined;
            to = undefined;
        }

        let searchOrderBy: ArrangeBy = "created";
        if (url.searchParams.has("by")) {
            let searchParamValue = url.searchParams.get("by") || "";
            searchOrderBy = ["name", "created", "description"].includes(
                searchParamValue,
            )
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

        let orderBy = {
            [searchOrderBy]: searchOrder,
        };

        let whereClause: Prisma.DueTypesFindManyArgs["where"] = {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        };

        if (isActive !== undefined && typeof isActive === "boolean") {
            whereClause.isActive = isActive;
        }

        let [totalItems, dues] = await prismaClient.$transaction([
            prismaClient.dueTypes.count({ where: whereClause }),
            prismaClient.dueTypes.findMany({
                where: whereClause,
                ...(!getAllRecord && {
                    skip: getSkippedPrismaValue(page, count),
                    take: count,
                }),
                orderBy,
                select: $Types.users,
            }),
        ]);

        let pageData = humps.camelizeKeys(dues);

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

AdminDuesRoute.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let body: DuesRequestBody = req.body;

        if (!body.name) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.AmountMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.description) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.DescriptionMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.dueDate) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.DueDateMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }
        let amount = parseMoneyAmount(body.amount);

        if (!amount) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.AmountMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let dueDate = body.dueDate ? new Date(body.dueDate) : null;

        let dues = await prismaClient.dueTypes.create({
            data: {
                createdById: userId,
                name: body.name,
                description: body.description,
                amount: amount,
                dueDate: dueDate,
            },
            select: $Types.duesTypes,
        });

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(dues),
                undefined,
            ),
        );
    }),
);

export default AdminDuesRoute;
