import express from "express";
import { userRouter } from "./user";
import { contentRouter } from "./content";
const router = express.Router();    

router.use("/user", userRouter)
router.use("/content", contentRouter)

export {router}