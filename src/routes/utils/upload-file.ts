import express from "express";
import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { auth, multerB2Upload } from "../../middleware/index.js";
import { sendResponse } from "../../utilites/index.js";
import {
    ErrorType,
    HandleServerError,
    kDefaultSuccessMessage,
    kFileFormDataKey,
} from "../../constants/index.js";

const UploadFileRoute = express.Router();
UploadFileRoute.use(auth());

UploadFileRoute.post(
    "/",
    multerB2Upload().array(kFileFormDataKey),
    asyncHandler(async (req: Request, res: Response) => {
        let files = req.files as Express.MulterS3.File[];

        if (!files || files.length === 0) {
            let { message, errorCode, statusCode } = HandleServerError(
                ErrorType.FileMissing,
            );
            res.status(statusCode).json(
                sendResponse(false, message, undefined, errorCode),
            );
            return;
        }

        let uploaded = files.map((file) => ({
            fileUrl: file.location,
            bucket: file.bucket,
            key: file.key,
            mimeType: file.mimetype,
            originalName: file.originalname,
        }));
        res.status(200).json(
            sendResponse(true, kDefaultSuccessMessage, uploaded, undefined),
        );
    }),
);

export default UploadFileRoute;
