import "dotenv/config"; // loads env file first
import express from "express";
import { connectDb } from "./database/db.js";
import bookRoutes from "./routes/book.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT || 8081;

await connectDb();

app.use(express.json()); // parse the json
app.use(cookieParser()); // parse the cookies

//routes

app.use("/api/books", bookRoutes); // book routes
app.use("/api/auth", authRoutes); // auth routes
app.use("/api/admin", adminRoutes); // admin routes
app.use("/api/user", userRoutes); // user routes

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
