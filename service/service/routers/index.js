import { Router } from "express";
import userRouter from "./user-router.js";
import propertyRouter from "./property-router.js";
import messageRouter from "./message-router.js";
import analyticsRouter from "./analytics-router.js";
import chatRoutes from "../service/service/routers/chat.js";

const router = Router();

router.use("/auth", userRouter);
router.use("/properties", propertyRouter);
router.use("/messages", messageRouter);
router.use("/analytics", analyticsRouter);
router.use("/api/chat", chatRoutes)

export default router;
