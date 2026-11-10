import express, { type Response, type Request } from "express";
import LoginRoute from "./login.js";

const AuthRoute = express.Router();

AuthRoute.use("/login", LoginRoute);

export default AuthRoute;
