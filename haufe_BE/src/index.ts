import express from "express";
// import mongoose from "mongoose";
// import jwt from "jsonwebtoken"
import cors from "cors";
import { router as mainRouter } from "./routes";


const app = express();

app.use(cors());
app.use(express.json())

app.use("/api/v1", mainRouter);

app.listen(3000, () => {
    console.log(`Server is running on port ${3000}`);
}); 