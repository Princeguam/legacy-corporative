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
} from "../../utilites/index.js";
import { userPermit, auth } from "../../middleware/index.js";
import AdminUserRoute from "./users/index.js";
import AdminTransactionRoute from "./transaction/index.js";
import AdminDashboard from "./dashboard.js";
import AdminFeedbackRoute from "./feedback/index.js";
import AdminBankAccountRoute from "./bankAccount/index.js";

const AdminRoute = express.Router();
AdminRoute.use(auth());
AdminRoute.use(userPermit());

AdminRoute.use("/user", AdminUserRoute);
AdminRoute.use("/transaction", AdminTransactionRoute);
AdminRoute.use("/dashboard", AdminDashboard);
AdminRoute.use("/feedback", AdminFeedbackRoute);
AdminRoute.use("/bank", AdminBankAccountRoute);

export default AdminRoute;
