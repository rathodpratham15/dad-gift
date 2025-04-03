import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";

const router = Router();

// Get all users (Admin only)
router.get("/users", authMiddleware, getAllUsers);

export default router;

