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
import homeConfigRoutes from "../service/service/routers/homeConfigRoutes.js";
import resetPasswordRoutes from "../service/service/routers/resetPasswordRoutes.js";
import notificationRoutes from "../service/service/routers/notificationRoutes.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

// Note: Vercel functions are read-only, uploads should use external storage
// For now, we'll handle uploads in memory or use a cloud storage service

// Middleware
app.use(cors());
app.use(express.json());
// Static uploads are handled separately in Vercel
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/upload", uploadRoutes);
// Static uploads are handled separately in Vercel
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/user-views", userViewsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/home", homeConfigRoutes);
app.use("/api/notifications", notificationRoutes);

// Add after other routes:
app.use("/api/auth", resetPasswordRoutes);

console.log("✅ /api/chat route registered");

// MongoDB connection
let isConnected = false;

async function connectToDatabase() {
    if (isConnected) {
        return;
    }
    
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            bufferCommands: false
        });
        isConnected = true;
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
}

// Initialize database connection
connectToDatabase();

// Export the app for Vercel
export default app;