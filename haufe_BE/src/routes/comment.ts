import express, { Request, Response } from "express";
import { authMiddleware } from "../middleswares/middleware";
import zod from "zod";
import { CommentModel, ContentModel } from "../modules/db";
import mongoose from "mongoose";

export const commentRouter = express.Router();

const createCommentSchema = zod.object({
    comment: zod.string().min(1).max(2000),
    type: zod.enum(['suggestion', 'bug', 'improvement', 'approval', 'general']).optional()
});

const updateCommentSchema = zod.object({
    comment: zod.string().min(1).max(2000).optional(),
    type: zod.enum(['suggestion', 'bug', 'improvement', 'approval', 'general']).optional()
});

// POST /api/v1/comment/:contentId - Adaugă comentariu la un proiect
commentRouter.post("/:contentId", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { contentId } = req.params;
        const reviewerId = (req as any).userId;

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            res.status(400).json({
                message: "Invalid content ID"
            });
            return;
        }

        // Check if content exists
        const content = await ContentModel.findById(contentId);
        if (!content) {
            res.status(404).json({
                message: "Content not found"
            });
            return;
        }

        const parsed = createCommentSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid input",
                errors: parsed.error.errors
            });
            return;
        }

        const { comment, type } = parsed.data;

        const newComment = await CommentModel.create({
            contentId,
            reviewerId,
            comment,
            type: type || 'general'
        });

        const populatedComment = await CommentModel.findById(newComment._id)
            .populate('reviewerId', 'firstName lastName email')
            .populate('contentId', 'title');

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (err) {
        console.error("Create comment error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// GET /api/v1/comment/:contentId - Vezi toate comentariile pentru un proiect
commentRouter.get("/:contentId", async (req: Request, res: Response) => {
    try {
        const { contentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            res.status(400).json({
                message: "Invalid content ID"
            });
            return;
        }

        const comments = await CommentModel.find({ contentId })
            .populate('reviewerId', 'firstName lastName email')
            .sort({ _id: -1 }); // Sort by MongoDB _id (newest first)

        res.status(200).json({
            message: "Comments retrieved successfully",
            count: comments.length,
            comments
        });

    } catch (err) {
        console.error("Get comments error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// PUT /api/v1/comment/:id - Actualizează un comentariu
commentRouter.put("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Invalid comment ID"
            });
            return;
        }

        const parsed = updateCommentSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid input",
                errors: parsed.error.errors
            });
            return;
        }

        // Check if comment exists and user owns it
        const comment = await CommentModel.findById(id);
        if (!comment) {
            res.status(404).json({
                message: "Comment not found"
            });
            return;
        }

        if (comment.reviewerId.toString() !== userId) {
            res.status(403).json({
                message: "Not authorized to update this comment"
            });
            return;
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(
            id,
            parsed.data,
            { new: true }
        ).populate('reviewerId', 'firstName lastName email')
         .populate('contentId', 'title');

        res.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment
        });

    } catch (err) {
        console.error("Update comment error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// DELETE /api/v1/comment/:id - Șterge un comentariu
commentRouter.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                message: "Invalid comment ID"
            });
            return;
        }

        const comment = await CommentModel.findById(id);
        if (!comment) {
            res.status(404).json({
                message: "Comment not found"
            });
            return;
        }

        if (comment.reviewerId.toString() !== userId) {
            res.status(403).json({
                message: "Not authorized to delete this comment"
            });
            return;
        }

        await CommentModel.findByIdAndDelete(id);

        res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (err) {
        console.error("Delete comment error:", err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
