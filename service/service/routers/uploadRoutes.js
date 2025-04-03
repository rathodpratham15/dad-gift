import { Router } from "express";
import upload from "../utils/fileUpload.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, (req, res) => {
    upload.array("images", 10)(req, res, (err) => { // 🔥 Allows multiple images
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(200).json({
            message: "Files uploaded successfully",
            filePaths: req.files.map(file => `/uploads/${file.filename}`),
        });
    });
});

export default router;
