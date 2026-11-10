import express, { type Response, type Request } from "express";
import AuthRoute from "./auth/index.js";

const V1Route = express.Router();

V1Route.use("/auth", AuthRoute);

export default V1Route;
