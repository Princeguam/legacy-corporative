import express from "express";
import UploadFileRoute from "./upload-file.js";
import DuesRoute from "./dues.js";

const UtilsRoute = express.Router();

UtilsRoute.use("/upload", UploadFileRoute);
UtilsRoute.use("/dues", DuesRoute);

export default UtilsRoute;
