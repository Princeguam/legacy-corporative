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
    kAppUrl,
    kBaseName,
    kBrandLogo,
    kBrandLogoWatermark,
} from "../../../constants/index.js";
import {
    sendResponse,
    prismaClient,
    generatJwtToken,
    parseBoolean,
    getSkippedPrismaValue,
    Prisma,
    parseMoneyAmount,
    sendEmail,
} from "../../../utilites/index.js";
import humps from "humps";
import { hash } from "bcrypt";
import { createMemberEmail } from "../../../constants/templates/member-email.js";

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

        let temporaryPassword = process.env.TEMP_PASSWORD || "Password@123";

        const message = createMemberEmail(
            {
                to: member.email,
                recipientName: member?.fullName ?? member.firstName,
                subject: "Welcome to Legacy Wealth Cooperatives",
                title: "Welcome to Legacy Wealth Cooperatives",

                richBody: [
                    {
                        type: "paragraph",
                        content: [
                            { type: "text", value: "Dear " },
                            {
                                type: "text",
                                value: member?.fullName ?? member.firstName,
                                bold: true,
                            },
                            { type: "text", value: "," },
                        ],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "We are delighted to welcome you to ",
                            },
                            {
                                type: "text",
                                value: "Legacy Wealth Cooperatives",
                                bold: true,
                            },
                            {
                                type: "text",
                                value: "! We're excited to have you on board and look forward to making your experience with us valuable and rewarding.",
                            },
                        ],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "Our platform is currently under active development as we continue working to improve the system and introduce more features that will make managing and accessing your cooperative services easier and more convenient.",
                            },
                        ],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "As we continue building, your feedback is important to us. We would greatly appreciate hearing your thoughts, suggestions, and any features you would like to see on the platform. Your input will help us shape the system to better meet your needs.",
                            },
                        ],
                    },
                    {
                        type: "heading",
                        content: [{ type: "text", value: "Getting Started" }],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "You can now visit our website and log in to your account using the credentials provided below:",
                            },
                        ],
                    },
                    {
                        type: "list",
                        items: [
                            [
                                {
                                    type: "text",
                                    value: "Website: ",
                                    bold: true,
                                },
                                {
                                    type: "text",
                                    value: kAppUrl,
                                    color: "primary",
                                },
                            ],
                            [
                                {
                                    type: "text",
                                    value: "Email: ",
                                    bold: true,
                                },
                                {
                                    type: "text",
                                    value: member.email,
                                    bold: true,
                                },
                            ],
                            [
                                {
                                    type: "text",
                                    value: "Temporary Password: ",
                                    bold: true,
                                },
                                {
                                    type: "text",
                                    value: temporaryPassword,
                                    bold: true,
                                    color: "primary",
                                },
                            ],
                        ],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "For your account security, please log in using your temporary password and change it immediately to a new, secure password of your choice.",
                            },
                        ],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "We will continue rolling out additional features and improvements over time, and we encourage you to visit the platform regularly to stay up to date with what's new.",
                            },
                        ],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "Thank you for being part of Legacy Wealth Cooperatives. We appreciate your trust and look forward to growing together.",
                            },
                        ],
                    },
                    {
                        type: "paragraph",
                        content: [{ type: "text", value: "Warm regards," }],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "Legacy Wealth Cooperatives",
                                bold: true,
                            },
                        ],
                    },
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                value: "Rooted in trust. Growing together.",
                                italic: true,
                                color: "muted",
                            },
                        ],
                    },
                ],
            },

            {
                images: {
                    logo: kBrandLogo,
                    watermark: kBrandLogoWatermark,
                },
            },
        );
        sendEmail(message.to, message.subject, message.html);
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
