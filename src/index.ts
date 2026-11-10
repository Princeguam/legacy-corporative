import "dotenv/config";
import express, { type Request, type Response } from "express";
import { requestTempStore } from "./middleware/index.js";
import V1Route from "./routes/index.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(requestTempStore());

app.get("/", (_: Request, res: Response) => {
    res.send("Welcome to api backend");
});

app.get("/health", (_: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Server health Ok!",
        data: new Date(),
    });
});

app.use("/api", V1Route);

app.listen(PORT, () => {
    console.log(`Server running on port:${PORT}`);
});
