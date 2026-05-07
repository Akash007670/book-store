import Book from "../models/book.js";
import { uploadFile } from "../helpers/uploadToCloudinary.js";

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    if (books?.length > 0)
      return res
        .status(200)
        .json({ message: "All books fetched", data: books });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Something went wrong" });
  }
};
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) return res.status(200).json({ message: "success", data: book });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: `couldn't find book with this id: ${req.params.id}` });
  }
};
const createBook = async (req, res) => {
  try {
    const formData = req.body || {};
    const resp = await Book.create(formData);
    if (resp) {
      return res
        .status(200)
        .json({ success: true, message: "Book Created", data: formData });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
};
const deleteBook = async (req, res) => {
  try {
    const id = req.params.id;
    const resp = await Book.findByIdAndDelete(id);
    if (resp)
      return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Something went wrong" });
  }
};
const updateBook = async (req, res) => {
  try {
    const id = req.params.id;
    const formData = req.body;

    const updatedBook = await Book.findByIdAndUpdate(id, formData, {
      new: true,
    });
    if (!updatedBook)
      return res.status(404).json({ message: "Book can't found" });

    return res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Something went wrong" });
  }
};
const upload = async (req, res) => {
  try {
    const file = req.file; // get the file
    const bookId = req.params.bookId; // get the book id from the params.

    console.log(req.user, "Request");

    if (!bookId) {
      return res.status(400).json({ message: "Book Id is missing" });
    }

    if (!file) {
      return res.status(400).json({ message: "File is missing" });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(400).json({ message: "Book not found!!" });
    }

    // upload to cloudinary
    const { publicId, url, resourceType } = await uploadFile(file.path);

    // If upload success then update the book with new file data and save it

    book.file = {
      url,
      publicId,
      resourceType,
    };

    book.uploadedBy = req.user.id;

    await book.save();

    return res.status(200).json({
      message: "File uploaded",
      file: book.file,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export { getAllBooks, getBookById, createBook, deleteBook, updateBook, upload };
