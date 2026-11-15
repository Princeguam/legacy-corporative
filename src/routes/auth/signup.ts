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
} from "../../constants/index.js";
import { sendResponse } from "../../utilites/sendResponse.js";
import { prismaClient } from "../../utilites/prismaClient.js";
import bcrypt from "bcrypt";
import humps from "humps";
import { addDays } from "date-fns";
import { generatJwtToken } from "../../utilites/index.js";
import { $Enums } from "../../constants/enums.js";

const SignupRoute = express.Router();

export default SignupRoute;
