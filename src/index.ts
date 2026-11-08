import "dotenv/config";
import express, { type Request, type Response } from "express";
import { requestTempStore } from "./middleware/index.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(requestTempStore());

app.get("/", (_: Request, res: Response) => {
    res.send("Welcome to api backend");
});

app.listen(PORT, () => {
    console.log(`Server running on port:${PORT}`);
});
