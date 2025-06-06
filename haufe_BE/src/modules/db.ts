const mongoose = require("mongoose")
import { MONGO_URI } from "../config";

mongoose.connect(MONGO_URI)

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const contentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    title: {
        type: String,
        required: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        maxLength: 1000
    },
    codeContent: {
        type: String, // For small code snippets
        maxLength: 10000
    },
    githubUrl: {
        type: String,
        validate: {
            validator: function(v: string) {
                return !v || /^https:\/\/github\.com\//.test(v);
            },
            message: 'Must be a valid GitHub URL'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const commentSchema = new Schema({
    contentId: {
        type: Schema.Types.ObjectId,
        ref: "contents",
        required: true
    },
    reviewerId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    comment: {
        type: String,
        required: true,
        maxLength: 2000
    },
    type: {
        type: String,
        enum: ['suggestion', 'bug', 'improvement', 'approval', 'general'],
        default: 'general'
    },

})

const UserModel = mongoose.model("users", userSchema);
const ContentModel = mongoose.model("contents", contentSchema);
const CommentModel = mongoose.model("comments", commentSchema);

export {UserModel, ContentModel, CommentModel}