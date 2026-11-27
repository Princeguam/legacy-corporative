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
    kDefaultMinimumContibutionAmount,
} from "../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
    parseDateRangeValue,
    determineRemainingContribution,
    dashboardChartWindow,
    type Range,
    monthKey,
    getMonthName,
} from "../utilites/index.js";
import humps from "humps";

import { auth } from "../middleware/auth.js";
import { endOfYear, startOfYear } from "date-fns";

const DashboardRoute = express.Router();

DashboardRoute.use(auth());

DashboardRoute.get(
    "/graph",
    asyncHandler(async (req, res) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let year = parseInt(String(req.query.year));
        let month = parseInt(String(req.query.month)) as Range;

        let now = new Date();

        if (
            !Number.isInteger(year) ||
            year < 2000 ||
            year > 2100 ||
            ![3, 6, 12].includes(month)
        ) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.InvalidInput,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let { start, end } = dashboardChartWindow(year, month);

        const [rows, yearAggregate] = await Promise.all([
            prismaClient.$queryRaw<
                { month: Date; total: bigint; count: number }[]
            >`
               SELECT
               m.month,
               COALESCE(SUM(t.amount), 0)::bigint AS total,
               COUNT(t.id)::int                   AS count
               FROM generate_series(${start}::timestamp, ${end}::timestamp, interval '1 month') AS m(month)
               LEFT JOIN "PaymentTransactions" t
               ON  t."period" >= m.month
               AND t."period" <  m.month + interval '1 month'
               AND t.status = 'CONFIRMED'
               AND t.type   = 'DEPOSIT'
               AND t."userId" = ${userId}
               GROUP BY m.month
               ORDER BY m.month
          `,
            prismaClient.paymentTransactions.aggregate({
                where: {
                    status: $Enums.TransactionStatus.CONFIRMED,
                    type: $Enums.TransactionType.DEPOSIT,
                    userId: userId,
                    period: {
                        gte: new Date(Date.UTC(year, 0, 1)),
                        lt: new Date(Date.UTC(year + 1, 0, 1)),
                    },
                },
                _sum: {
                    amount: true,
                },
                _count: {
                    id: true,
                },
            }),
        ]);
        const periodTotal = rows.reduce((sum, r) => sum + r.total, 0n);
        const periodCount = rows.reduce((sum, r) => sum + r.count, 0);

        let payload = {
            year: year,
            months: month,
            from: monthKey(start),
            to: monthKey(end),
            currency: "NGN",
            unit: "kobo",
            labels: rows.map((r) => getMonthName(r.month)),
            period: rows.map((r) => monthKey(r.month)),
            series: [
                {
                    key: "deposits",
                    name: "Confirmed deposits",
                    data: rows.map((r) => r.total),
                },
            ],
            summary: {
                periodTotal,
                periodCount,
                yearTotal: yearAggregate._sum.amount ?? 0n,
                yearCount: yearAggregate._count.id,
            },
        };

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(payload),
                undefined,
            ),
        );
    }),
);

DashboardRoute.get(
    "/stats",
    asyncHandler(async (req, res) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let period = Number(req.query.period);

        let whereClause: Prisma.PaymentTransactionsAggregateArgs["where"] = {
            userId: userId,
            type: $Enums.TransactionType.DEPOSIT,
        };

        let start = new Date(Date.UTC(period, 0, 1));
        let end = new Date(Date.UTC(period + 1), 0, 1);

        if (period) {
            whereClause.period = {
                gte: start,
                lt: end,
            };
        }
        let [total, confirmed, pending] = await prismaClient.$transaction([
            prismaClient.paymentTransactions.aggregate({
                where: whereClause,
                _sum: {
                    amount: true,
                },
            }),
            prismaClient.paymentTransactions.aggregate({
                where: {
                    ...whereClause,
                    status: $Enums.TransactionStatus.CONFIRMED,
                },
                _sum: {
                    amount: true,
                },
            }),
            prismaClient.paymentTransactions.aggregate({
                where: {
                    ...whereClause,
                    status: $Enums.TransactionStatus.PENDING,
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        let confirmentAmount = parseMoneyAmount(confirmed._sum.amount ?? 0n);
        let pendingAmount = parseMoneyAmount(pending._sum.amount ?? 0n);

        let target =
            kDefaultMinimumContibutionAmount * (period === 2026 ? 4n : 12n);

        let stats = {
            total: parseMoneyAmount(total._sum.amount ?? 0n),
            stats: {
                confirmed: confirmentAmount ?? 0,
                pending: pendingAmount ?? 0,
                remaining: determineRemainingContribution(
                    period ?? new Date(),
                    confirmentAmount ?? 0n,
                ),
                target: target,
            },
        };

        console.log(stats);

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(stats),
                undefined,
            ),
        );
    }),
);

export default DashboardRoute;
