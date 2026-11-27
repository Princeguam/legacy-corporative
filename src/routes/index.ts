import express, { type Response, type Request } from "express";
import AuthRoute from "./auth/index.js";
import TransactionRoute from "./transaction/index.js";
import ProfileRoute from "./profile/index.js";
import swaggerJSDoc, {
    type Options as swaggerJsDocOption,
} from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import FeedbackRoute from "./feedback/index.js";
import NotificationRoute from "./notification/index.js";
import DashboardRoute from "./dashboard.js";
import UtilsRoute from "./utils/index.js";
import AdminRoute from "./admin/index.js";
import SettingsRoute from "./settings.js";
import BankAccountRoute from "./bankAccount/index.js";
import DuesRoute from "./utils/dues.js";
import MeetingRoute from "./meeting/index.js";

const V1Route = express.Router();

const options: swaggerJsDocOption = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Legacy wealth Server",
            version: "1.0.0",
            description: "Legacy wealth server",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}/api`,
                description: "Development server",
            },

            {
                url: `${process.env.API_HOST_URL}`,
                description: "Production server",
            },
        ],
        components: {
            securitySchemas: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["**/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

V1Route.use("/docs", swaggerUi.serve);
V1Route.get("/docs", swaggerUi.setup(swaggerSpec));
V1Route.use("/auth", AuthRoute);
V1Route.use("/transaction", TransactionRoute);
V1Route.use("/profile", ProfileRoute);
V1Route.use("/feedback", FeedbackRoute);
V1Route.use("/notification", NotificationRoute);
V1Route.use("/dashboard", DashboardRoute);
V1Route.use("/util", UtilsRoute);
V1Route.use("/admin", AdminRoute);
V1Route.use("/setting", SettingsRoute);
V1Route.use("/bank", BankAccountRoute);
V1Route.use("/due", DuesRoute);
V1Route.use("/meeting", MeetingRoute);
export default V1Route;
