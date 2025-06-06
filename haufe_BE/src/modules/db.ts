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
})

const UserModel = mongoose.model("users", userSchema);
const ContentModel = mongoose.model("contents", contentSchema);

export {UserModel, ContentModel}