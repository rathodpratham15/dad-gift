// src/routes/propertyRoutes.js
import { Router } from "express";
import {
    getAllProperties,
    getPropertyById,
    addProperty,
    deleteProperty,
    updateProperty,
    uploadImages,
    getSimilarProperties,
} from "../controllers/propertyController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../utils/fileUpload.js";

const router = Router();

// Get all properties
router.get("/", getAllProperties);

// Get a property by ID
router.get("/:id", getPropertyById);

// Add a new property (Admin only)
router.post("/", authMiddleware, addProperty);

// Update a property (Admin only)
router.put("/:id", authMiddleware, updateProperty);

// Delete a property (Admin only)
router.delete("/:id", authMiddleware, deleteProperty);

// New route for similar properties
router.get("/:id/similar", getSimilarProperties);

router.post("/upload", upload.array("images", 10), uploadImages);
router.post("/upload", upload.any(), async (req, res) => {
    console.log("Files received:", req.files);
    console.log("Body received:", req.body);

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded." });
        }

        const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
        res.status(200).json({ filePaths });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ message: "Server error during image upload." });
    }
});

export default router;