import { Router } from "express";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
  upload,
} from "../controllers/book-controller.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/all", getAllBooks);

router.get("/:id", getBookById);

router.post("/create", createBook);

router.delete("/:id", deleteBook);

router.put("/:id", updateBook);

router.post(
  "/:bookId/upload",
  authMiddleware,
  roleMiddleware("admin"),
  uploadMiddleware.single("file"),
  upload,
);

export default router;
