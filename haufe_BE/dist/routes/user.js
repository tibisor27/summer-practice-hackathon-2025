"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = __importDefault(require("zod"));
const config_1 = require("../config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../modules/db");
exports.userRouter = express_1.default.Router();
const signupSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
    firstName: zod_1.default.string(),
    lastName: zod_1.default.string(),
});
const signInSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string()
});
const updateBody = zod_1.default.object({
    password: zod_1.default.string().optional(),
    firstName: zod_1.default.string().optional(),
    lastName: zod_1.default.string().optional(),
});
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid input",
                issues: parsed.error.errors
            });
            return;
        }
        const { email, password, firstName, lastName } = parsed.data;
        // Check if user exists
        const existingUser = yield db_1.UserModel.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                message: "email already taken"
            });
            return;
        }
        // Create new user
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield db_1.UserModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });
        const userId = user._id;
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId }, config_1.JWT_SECRET, { expiresIn: "1h" });
        // Return success response
        res.status(201).json({
            message: "User created successfully",
            token,
            userId: user._id
        });
    }
    catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
        return;
    }
}));
exports.userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const parsedData = signInSchema.safeParse(body);
        if (!parsedData.success) {
            res.status(411).json({
                message: "Error while logging in"
            });
            return;
        }
        const email = body.email;
        const password = body.password;
        const user = yield db_1.UserModel.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                message: "Incorrect email"
            });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: "Invalid password"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({
            token,
            userId: user._id,
            email: user.email,
            message: "Login successful"
        });
    }
    catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
        return;
    }
}));
