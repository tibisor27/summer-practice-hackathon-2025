import express ,{ Request, Response }from "express"
import { authMiddleware } from "../middleswares/middleware"
import zod, { ParseStatus, string } from "zod";
import { ContentModel } from "../modules/db"
import mongoose from "mongoose"

export const contentRouter = express.Router()

const createContentSchema = zod.object({
    title: zod.string().min(1).max(100),
    description: zod.string().min(1).max(1000),
    codeContent: zod.string().max(10000).optional(),
    githubUrl: zod.string().url().optional()
});

contentRouter.post("/add", authMiddleware, async (req: Request, res: Response) => {
    try {
        // Validate input
        const parsed = createContentSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid input",
                errors: parsed.error.errors
            });
            return;
        }

        const userId = (req as any).userId; // from auth middleware
        const { title, description, codeContent, githubUrl } = parsed.data;

        // Create new content
        const content = await ContentModel.create({
            userId,
            title,
            description,
            codeContent,
            githubUrl
        });

        const populatedContent = await ContentModel.findById(content._id)
            .populate('userId', 'firstName lastName username');

        res.status(201).json({
            message: "Content created successfully",
            contentId: content._id,
            content: populatedContent
        });

    } catch (err) {
        console.error("Create content error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})