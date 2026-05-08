import { Router } from "express";
import { getAllUsers } from "../controllers/user-controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/all", authMiddleware, roleMiddleware("user"), getAllUsers);

export default router;
