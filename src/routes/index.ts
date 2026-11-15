import express, { type Response, type Request } from "express";
import AuthRoute from "./auth/index.js";
import TransactionRoute from "./transaction/index.js";
import ProfileRoute from "./profile/index.js";
import swaggerJSDoc, {
    type Options as swaggerJsDocOption,
} from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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

export default V1Route;
