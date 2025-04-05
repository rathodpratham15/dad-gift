import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import authRoutes from "../service/service/routers/authRoutes.js";
import adminRoutes from "../service/service/routers/adminRoutes.js";
import propertyRoutes from "../service/service/routers/propertyRoutes.js";
import userRoutes from "../service/service/routers/userRoutes.js";
import analyticsRoutes from "../service/service/routers/analyticsRoutes.js";
import messagesRoutes from "../service/service/routers/messagesRoutes.js";
import uploadRoutes from "../service/service/routers/uploadRoutes.js";
import userViewsRoutes from "../service/service/routers/userViewsRoutes.js";
import chatRoutes from "../service/service/routers/chat.js";
import homeConfigRoutes from "./service/routers/homeConfigRoutes.js";
import resetPasswordRoutes from "./service/routers/resetPasswordRoutes.js"; // ✅ path from root
import notificationRoutes from "./service/routers/notificationRoutes.js"; // Adjust if needed





dotenv.config();

const app = express();
const __dirname = path.resolve();

// Ensure the uploads directory exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/user-views", userViewsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/home", homeConfigRoutes);
app.use("/api/notifications", notificationRoutes);

// Add after other routes:
app.use("/api/auth", resetPasswordRoutes); // ✅ this will make POST /api/auth/reset-password available

console.log("✅ /api/chat route registered");



// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

