import { Router } from "express";
import { getAllMessages, createMessage } from "../controllers/messageControllers.js";

const router = Router();

// Get all messages
router.get("/", getAllMessages);

// Create a new message
router.post("/", createMessage);

export default router;
