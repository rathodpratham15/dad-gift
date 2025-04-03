import User from "../models/UserModel.js";
import Favorite from "../models/FavoriteModel.js";
// import Property from "../models/PropertyModel.js"; // Ensure Property model is imported

// Get user profile
export async function getProfile(req, res) {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Update user profile
export async function updateProfile(req, res) {
    try {
        const { name, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Add property to favorites
export async function addFavorite(req, res) {
    try {
        const { propertyId } = req.body;

        const existingFavorite = await Favorite.findOne({ userId: req.userId, propertyId });
        if (existingFavorite) {
            return res.status(409).json({ message: "Property already in favorites" });
        }

        const favorite = new Favorite({ userId: req.userId, propertyId });
        await favorite.save();
        res.status(201).json({ message: "Property added to favorites" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Remove property from favorites
export async function removeFavorite(req, res) {
    try {
        const { propertyId } = req.params;

        const deletedFavorite = await Favorite.findOneAndDelete({ userId: req.userId, propertyId });
        if (!deletedFavorite) {
            return res.status(404).json({ message: "Favorite not found" });
        }

        res.status(200).json({ message: "Property removed from favorites" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Get user's favorite properties
export async function getFavorites(req, res) {
    try {
        console.log("🔍 Fetching favorites for user:", req.userId); // Debugging log

        const favorites = await Favorite.find({ userId: req.userId }).populate({
            path: "propertyId",
            select: "title type price location images",
        });

        if (!favorites || favorites.length === 0) {
            return res.status(200).json([]); // Return empty array if no favorites
        }

        const favoriteProperties = favorites.map((fav) => {
            if (!fav.propertyId) {
                console.warn("⚠️ Skipping invalid favorite entry:", fav); // Log issue
                return null;
            }
            return {
                _id: fav.propertyId._id,
                title: fav.propertyId.title,
                type: fav.propertyId.type,
                price: fav.propertyId.price,
                location: fav.propertyId.location,
                images: fav.propertyId.images || [], // Ensure images array
            };
        }).filter(Boolean); // Remove null entries

        console.log("✅ Favorites retrieved successfully:", favoriteProperties);
        res.status(200).json(favoriteProperties);
    } catch (error) {
        console.error("❌ Error fetching favorites:", error); // Log full error
        res.status(500).json({ message: "Server error while fetching favorites." });
    }
}


export async function getSearchHistory(req, res) {
    try {
        // Simulate search history response (can be connected to a database later)
        const searchHistory = []; // Replace this with actual logic
        res.status(200).json(searchHistory);
    } catch (error) {
        console.error("Error fetching search history:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Admin: Update User
export async function updateUser(req, res) {
    if (req.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email, role },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

// Admin: Delete User
export async function deleteUser(req, res) {
    if (req.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}


export default { getProfile, updateProfile, addFavorite, removeFavorite, getFavorites, getSearchHistory, updateUser, deleteUser };

