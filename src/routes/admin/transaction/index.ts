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
} from "../../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
    parseDateRangeValue,
} from "../../../utilites/index.js";
import bcrypt from "bcrypt";
import humps from "humps";
import { addDays, endOfMonth, startOfMonth } from "date-fns";
import { is } from "date-fns/locale";

const AdminTransactionRoute = express.Router();

type ArrangeBy = "status" | "created";

type ArrangeOrder = "asc" | "desc";

type QueryOrderByObject = Partial<Record<ArrangeBy, ArrangeOrder>>;

AdminTransactionRoute.get(
    "/all",
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

        let statuses = Object.values($Enums.TransactionStatus);
        let selectedStatuses = parseEnumList(req.query.status, statuses);

        let searchOrderBy: ArrangeBy = "created";
        if (url.searchParams.has("by")) {
            let searchParamValue = url.searchParams.get("by") || "";
            searchOrderBy = ["status", "address"].includes(searchParamValue)
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

        let whereClause: Prisma.PaymentTransactionsFindManyArgs["where"] = {
            OR: [
                {
                    note: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        };

        if (from || to) {
            whereClause.period = {};
            if (from) whereClause.period.gte = from;
            if (to) whereClause.period.lte = to;
        }
    }),
);

export default AdminTransactionRoute;
