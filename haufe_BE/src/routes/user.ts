import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import zod, { ParseStatus, string } from "zod";
import { JWT_SECRET } from "../config";
import bcrypt from "bcrypt";
import { UserModel } from "../modules/db";

export const userRouter = express.Router();

const signupSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
    firstName: zod.string(),
    lastName: zod.string(),

});

const signInSchema = zod.object({
    email: zod.string().email(),
    password: zod.string()
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

interface UserResponse {
    email: string;
    firstName: string;
    lastName: string;
    _id: string;
}


userRouter.post("/signup", async (req: Request, res: Response) => {
    try {
        // Validate input
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid input",
                issues: parsed.error.errors
            });
            return
        }

        const { email, password, firstName, lastName } = parsed.data;

        // Check if user exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                message: "email already taken"
            });
            return
        }


        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        const userId = user._id;

        

        // Generate JWT
        const token = jwt.sign(
            { userId },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Return success response
        res.status(201).json({
            message: "User created successfully",
            token,
            userId: user._id
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
        return
    }
});

userRouter.post("/signin", async (req: Request, res: Response) => {
    try {
        const body = req.body;

        const parsedData = signInSchema.safeParse(body);
        if (!parsedData.success) {
            res.status(411).json({
                message: "Error while logging in"
            })
            return
        }

        const email = body.email;
        const password = body.password;



        const user = await UserModel.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                message: "Incorrect email"
            });
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: "Invalid password"
            });
            return
        }

        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            token,
            userId: user._id,
            email: user.email,
            message: "Login successful"
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
        return
    }
})
