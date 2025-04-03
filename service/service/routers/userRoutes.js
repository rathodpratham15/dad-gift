import { Router } from "express";
import {
    getProfile,
    updateProfile,
    addFavorite,
    removeFavorite,
    getFavorites,
    getSearchHistory, // Add this import
    updateUser, // New function
    deleteUser  // New function
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/favorites", authMiddleware, addFavorite);
router.delete("/favorites/:propertyId", authMiddleware, removeFavorite);
router.get("/favorites", authMiddleware, getFavorites);

// Add route for search history
router.get("/search-history", authMiddleware, getSearchHistory);


// New Routes: Edit/Delete User (Admin Only)
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
