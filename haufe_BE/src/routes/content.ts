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

const updateContentSchema = zod.object({
    title: zod.string().min(1).max(100).optional(),
    description: zod.string().min(1).max(1000).optional(),
    codeContent: zod.string().max(10000).optional(),
    githubUrl: zod.string().url().optional()
});

// GET /api/v1/content/all - Vezi toate proiectele
contentRouter.get("/all", authMiddleware, async (req: Request, res: Response) => {
    try {
        const contents = await ContentModel.find()
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Contents retrieved successfully",
            count: contents.length,
            contents
        });
    } catch (err) {
        console.error("Get all contents error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// GET /api/v1/content/my - Vezi doar proiectele tale
contentRouter.get("/my", authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const contents = await ContentModel.find({ userId })
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Your contents retrieved successfully",
            count: contents.length,
            contents
        });
    } catch (err) {
        console.error("Get my contents error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// GET /api/v1/content/:id - Vezi un proiect specific
contentRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Invalid content ID"
            });
            return;
        }

        const content = await ContentModel.findById(id)
            .populate('userId', 'firstName lastName email');

        if (!content) {
            res.status(404).json({
                message: "Content not found"
            });
            return;
        }

        res.status(200).json({
            message: "Content retrieved successfully",
            content
        });
    } catch (err) {
        console.error("Get content error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// POST /api/v1/content/add - Creează proiect nou
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
            .populate('userId', 'firstName lastName email');

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
});

// PUT /api/v1/content/:id - Actualizează proiect
contentRouter.put("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Invalid content ID"
            });
            return;
        }

        const parsed = updateContentSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid input",
                errors: parsed.error.errors
            });
            return;
        }

        // Check if content exists and user owns it
        const content = await ContentModel.findById(id);
        if (!content) {
            res.status(404).json({
                message: "Content not found"
            });
            return;
        }

        if (content.userId.toString() !== userId) {
            res.status(403).json({
                message: "Not authorized to update this content"
            });
            return;
        }

        const updatedContent = await ContentModel.findByIdAndUpdate(
            id,
            { ...parsed.data, updatedAt: new Date() },
            { new: true }
        ).populate('userId', 'firstName lastName email');

        res.status(200).json({
            message: "Content updated successfully",
            content: updatedContent
        });
    } catch (err) {
        console.error("Update content error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// DELETE /api/v1/content/:id - Șterge proiect
contentRouter.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Invalid content ID"
            });
            return;
        }

        const content = await ContentModel.findById(id);
        if (!content) {
            res.status(404).json({
                message: "Content not found"
            });
            return;
        }

        if (content.userId.toString() !== userId) {
            res.status(403).json({
                message: "Not authorized to delete this content"
            });
            return;
        }

        await ContentModel.findByIdAndDelete(id);

        res.status(200).json({
            message: "Content deleted successfully"
        });
    } catch (err) {
        console.error("Delete content error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
