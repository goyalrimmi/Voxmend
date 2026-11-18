import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { registerVideo } from "../controllers/video.controller.js";

const router = Router();

router.post("/", authMiddleware, registerVideo);

export default router;
