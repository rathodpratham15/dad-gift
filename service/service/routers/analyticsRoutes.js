import { Router } from "express";
import { getAnalytics, logAnalytics } from "../controllers/analyticsController.js";
import { logUserView } from "../controllers/userViewsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Get analytics data (Admin only)
router.get("/", authMiddleware, getAnalytics);

// Log analytics data
router.post("/", authMiddleware, logAnalytics);

// Log a user view (requires authentication)
router.post("/user-views", authMiddleware, logUserView);

export default router;
