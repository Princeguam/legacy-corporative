import express from "express";
import UploadFileRoute from "./upload-file.js";

const UtilsRoute = express.Router();

UtilsRoute.use("/upload", UploadFileRoute);

export default UtilsRoute;
