import express from "express";
import { userRouter } from "./user";
import { contentRouter } from "./content";
import { commentRouter } from "./comment";

export const router = express.Router();    

router.use("/user", userRouter)
router.use("/content", contentRouter)
router.use("/comment", commentRouter)