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
    kDefaultSaltRounds,
} from "../../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
} from "../../../utilites/index.js";
import humps from "humps";
import { hash } from "bcrypt";

import AdminUserIDRoute from "./[userId]/index.js";

const AdminUserRoute = express.Router();

type ArrangeBy =
    | "fullName"
    | "email"
    | "phoneNo"
    | "address"
    | "gender"
    | "state"
    | "created";

type ArrangeOrder = "asc" | "desc";

type QueryOrderByObject = Partial<Record<ArrangeBy, ArrangeOrder>>;

AdminUserRoute.get(
    "/all",
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

        let isActive = parseBoolean(req.query.isActive);

        let getAllRecord =
            url.searchParams.get("all") && parseBoolean(req.query.all);

        let searchOrderBy: ArrangeBy = "created";
        if (url.searchParams.has("by")) {
            let searchParamValue = url.searchParams.get("by") || "";
            searchOrderBy = [
                "fullName",
                "created",
                "email",
                "phoneNo",
                "gender",
                "state",
                "address",
            ].includes(searchParamValue)
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

        let whereClause: Prisma.UsersFindManyArgs["where"] = {
            OR: [
                {
                    fullName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    phoneNo: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    gender: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    address: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    state: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        };

        if (isActive !== undefined && typeof isActive === "boolean") {
            whereClause.isActive = isActive;
        }

        let [totalItems, users] = await prismaClient.$transaction([
            prismaClient.users.count({ where: whereClause }),
            prismaClient.users.findMany({
                where: whereClause,
                ...(!getAllRecord && {
                    skip: getSkippedPrismaValue(page, count),
                    take: count,
                }),
                orderBy,
                select: $Types.users,
            }),
        ]);

        let pageData = humps.camelizeKeys(users);

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

AdminUserRoute.get(
    "/no",
    asyncHandler(async (req: Request, res: Response) => {
        let users = await prismaClient.users.findMany({
            where: {
                isActive: true,
                isDeleted: false,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                phoneNo: true,
            },
        });

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(users),
                undefined,
            ),
        );
    }),
);

AdminUserRoute.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let userId = req.store.get(kUserIdStoreKey);
        let userRole = req.store.get(kUserRoleStoreKey);

        let body = req.body ?? {};

        if (!body.firstName) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.FirstNameMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.lastName) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.LastNameMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.email) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.EmailMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        if (!body.phoneNo) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PhoneNoMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let emailExist = await prismaClient.users.findFirst({
            where: {
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

        let phoneExist = await prismaClient.users.findFirst({
            where: {
                phoneNo: body.phoneNo,
            },
            select: { id: true },
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

        let tempPassword = process.env.TEMP_PASSWORD;

        if (!tempPassword) {
            let { statusCode, message, errorCode } = HandleServerError(
                ErrorType.PhoneNoMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let hashedPassword = await hash(tempPassword, kDefaultSaltRounds);

        let member = await prismaClient.users.create({
            data: {
                firstName: body.firstName,
                middleName: body.middleName,
                lastName: body.lastName,
                fullName: `${body.firstName} ${body.lastName} ${body.middleName}`,
                email: body.email,
                phoneNo: body.phoneNo,
                dob: body.dob ? new Date(body.dob) : null,
                occupation: body.occupation,
                nextOfKinName: body.nextOfKinName,
                nextOfKinPhone: body.nextOfKinPhone,
                nextOfKinRelationship: body.nextOfKinRelationship,
                emergencyContact: body.emergencyContact,
                emergencyContactPhone: body.emergencyContactPhone,
                emergencyContactRelationship: body.emergencyContactRelationship,
                address: body.address,
                password: hashedPassword,
                state: body.state,
                lga: body.lga,
                gender: body.gender,
                passport: body.passport,
                role: $Enums.UserRole.User,
            },
            select: $Types.users,
        });

        res.status(200).json(
            sendResponse(
                true,
                kDefaultSuccessMessage,
                humps.camelizeKeys(member),
                undefined,
            ),
        );
    }),
);

AdminUserRoute.use("/", AdminUserIDRoute);

export default AdminUserRoute;
