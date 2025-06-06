import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

interface DecodedToken {
    userId: string;
    [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization;
    console.log("Token:", token);

    try {
        if (!token) {
            res.status(401).json({
                message: "Token is missing",
            });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

        if (!decoded?.userId) {
            res.status(403).json({
                message: "Invalid token",
            });
            return;
        }

        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(403).json({
            message: "Invalid or expired token",
        });
        return;
    }
};