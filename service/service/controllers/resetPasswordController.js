import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendResetEmail } from "../utils/emailService.js";

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    console.log("🔔 Password reset requested for:", email);

    try {
        const user = await User.findOne({ email });
        if (!user || user.provider === "google") {
            console.warn("⚠️ User not found or Google user.");
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

        console.log("✅ Sending reset link:", resetLink);
        await sendResetEmail(email, resetLink);

        res.status(200).json({ message: "Reset email sent" });
    } catch (error) {
        console.error("❌ Reset request error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save(); // ✅ This is critical

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(400).json({ message: "Invalid or expired token" });
    }
};
