import { Router } from "express";
import { logUserView, getUserViews } from "../controllers/userViewsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// POST: Log a user view
router.post("/", authMiddleware, logUserView);

// GET: Get all user views
router.get("/", authMiddleware, getUserViews);

export default router;
