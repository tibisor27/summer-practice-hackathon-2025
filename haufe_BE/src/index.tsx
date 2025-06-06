import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const app = express();
app.use(express.json());

app.listen(4000)



