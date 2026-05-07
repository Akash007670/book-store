import mongoose from "mongoose";
import { FileSchema } from "./file.js";

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"],
    trim: true,
    maxLength: [30, "title can not exceed 30 chars"],
    minLength: [3, "title length can not be less than 3 chars"],
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxLength: [30, "description can not exceed 30 chars"],
    minLength: [3, "description length can not be less than 3 chars"],
  },
  author: {
    type: String,
    required: [true, "author is required"],
    trim: true,
    maxLength: [30, "author can not exceed 30 chars"],
    minLength: [3, "author length can not be less than 3 chars"],
  },
  year: {
    type: Number,
    required: [true, "publication year is required"],
    min: [1000, "year must be atleast 1000"],
    max: [new Date().getFullYear(), "year cannot be in the future"],
  },
  file: {
    type: FileSchema,
  },
  uploadedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Book = mongoose.model("Book", BookSchema);
export default Book;
