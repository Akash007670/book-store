import { Router } from "express";
import { getAllUsers } from "../controllers/admin-controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/all", authMiddleware, roleMiddleware("admin"), getAllUsers);

export default router;
