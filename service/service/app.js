// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const routes = require("./routers");

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3002;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose
//     .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("Connected to MongoDB"))
//     .catch((err) => console.error("MongoDB connection error:", err));

// // Routes
// app.use("/api", routes);

// // Global Error Handler
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ error: "Something went wrong!" });
// });

// app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';

import authRoutes from './service/routers/authRoutes';
import propertyRoutes from './service/routers/propertyRoutes';
import userRoutes from './service/routers/userRoutes';
import analyticsRoutes from './service/routers/analyticsRoutes';
import connectDB from './service/config/db';
import resetPasswordRoutes from "./routes/resetPasswordRoutes.js";


config();
connectDB();

const app = express();

app.use(cors());
app.use(json());

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/auth', require('./routes/auth')); // or your path
app.use("/api/auth", resetPasswordRoutes);



app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});
