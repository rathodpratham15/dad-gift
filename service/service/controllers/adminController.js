import User from "../models/UserModel.js";

// Get all users (Admin only)

export async function getAllUsers(req, res) {
    if (req.role !== 'admin') {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export default { getAllUsers };
