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
    parseEnumList,
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
        let selectedStatuses = parseEnumList(
            String(req.query.status),
            statuses,
        );

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

        let whereClause: Prisma.PaymentTransactionsFindManyArgs["where"] = {};

        if (from || to) {
            whereClause.period = {};
            if (from) whereClause.period.gte = from;
            if (to) whereClause.period.lte = to;
        }
        if (selectedStatuses.length > 0) {
            whereClause.status = { in: selectedStatuses };
        }

        if (search) {
            let matchingStatuses = statuses.filter((status) =>
                status.toLowerCase().includes(search.toLowerCase()),
            );
            whereClause.OR = [
                {
                    note: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];

            if (matchingStatuses.length > 0) {
                whereClause.OR.push({ status: { in: matchingStatuses } });
            }
        }

        let [totalItems, transactions] = await prismaClient.$transaction([
            prismaClient.paymentTransactions.count({ where: whereClause }),
            prismaClient.paymentTransactions.findMany({
                where: whereClause,
                ...(!getAllRecord && {
                    skip: getSkippedPrismaValue(page, count),
                    take: count,
                }),
                orderBy,
                select: $Types.paymentTransactions,
            }),
        ]);

        let pageData = humps.camelizeKeys(transactions);

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

export default AdminTransactionRoute;
