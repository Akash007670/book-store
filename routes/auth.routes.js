import { Router } from "express";
import {
  login,
  logout,
  refresh,
  refreshV2,
  register,
  changePassword,
} from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh", refresh);

router.post("/refresh-v2", refreshV2);

router.post("/change-password", authMiddleware, changePassword);

export default router;
