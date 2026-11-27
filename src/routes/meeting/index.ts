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
    kNotificationTitle,
} from "../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
    parseDateRangeValue,
    parseEnumList,
} from "../../utilites/index.js";
import humps from "humps";

import MeetingIDRoute from "./[meetingId]/index.js";
const MeetingRoute = express.Router();

type ArrangeBy = "title" | "meetingUrl" | "created";

type ArrangeOrder = "asc" | "desc";

MeetingRoute.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

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

        let statuses = Object.values($Enums.AttendanceStatus);
        let selectedStatuses = parseEnumList(
            String(req.query.status),
            statuses,
        );

        let searchOrderBy: ArrangeBy = "created";
        if (url.searchParams.has("by")) {
            let searchParamValue = url.searchParams.get("by") || "";
            searchOrderBy = ["title", "meetingUrl"].includes(searchParamValue)
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

        let whereClause: Prisma.MeetingsFindManyArgs["where"] = {};

        if (from || to) {
            whereClause.heldAt = {};
            if (from) whereClause.heldAt.gte = from;
            if (to) whereClause.heldAt.lte = to;
        }

        if (selectedStatuses.length > 0) {
            whereClause.attendance = {
                some: { status: { in: selectedStatuses } },
            };
        }

        if (search) {
            let matchingStatuses = statuses.filter((status) =>
                status.toLowerCase().includes(search.toLowerCase()),
            );
            whereClause.OR = [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];

            if (matchingStatuses.length > 0) {
                whereClause.OR.push({
                    attendance: {
                        some: {
                            status: { in: matchingStatuses },
                        },
                    },
                });
            }
        }

        let [totalItems, meetings] = await prismaClient.$transaction([
            prismaClient.meetings.count({ where: whereClause }),
            prismaClient.meetings.findMany({
                where: whereClause,
                ...(!getAllRecord && {
                    skip: getSkippedPrismaValue(page, count),
                    take: count,
                }),
                orderBy,
                select: $Types.meetings,
            }),
        ]);

        let pageData = humps.camelizeKeys(
            meetings.map(({ attendance, ...otherData }) => ({
                ...otherData,
                attendance: attendance.map((a) => ({
                    id: a.id,
                    status: a.status,
                    joinedAt: a.joinedAt,
                    joinCount: a.joinCount,
                })),
            })),
        );

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

MeetingRoute.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);
    }),
);

MeetingRoute.use("/", MeetingIDRoute);
export default MeetingRoute;
