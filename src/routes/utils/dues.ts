import express from "express";
import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { auth, multerB2Upload } from "../../middleware/index.js";
import { prismaClient, sendResponse } from "../../utilites/index.js";
import {
    $Types,
    ErrorType,
    HandleServerError,
    kDefaultSuccessMessage,
    kFileFormDataKey,
} from "../../constants/index.js";
import humps from "humps";

const DuesRoute = express.Router();
DuesRoute.use(auth());

DuesRoute.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
        let dues = await prismaClient.dueTypes.findMany({
            where: {
                isActive: true,
            },
            select: $Types.duesTypes,
        });

        let payload = humps.camelizeKeys(
            dues.map(({ createdBy, ...otherData }) => ({
                ...otherData,
            })),
        );

        res.status(200).json(
            sendResponse(true, kDefaultSuccessMessage, payload, undefined),
        );
    }),
);

export default DuesRoute;
