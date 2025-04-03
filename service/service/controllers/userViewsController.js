import UserView from "../models/UserViews.js";
import Analytics from "../models/Analytics.js";

// Log user views
export const logUserView = async (req, res) => {
    const { userId, propertyId } = req.body;

    if (!userId || !propertyId) {
        return res.status(400).json({ message: "User ID and Property ID are required." });
    }

    try {
        // Check if the user has already viewed this property
        const existingView = await UserView.findOne({ userId, propertyId });

        if (existingView) {
            return res.status(200).json({ message: "View already logged." });
        }

        // Log the user's view
        const newUserView = new UserView({ userId, propertyId });
        await newUserView.save();

        // Increment the property view count in analytics
        const analytics = await Analytics.findOneAndUpdate(
            { propertyId },
            { $inc: { views: 1 } },
            { new: true, upsert: true }
        );

        res.status(201).json({
            message: "User view logged successfully.",
            analytics,
        });
    } catch (error) {
        console.error("Error logging user view:", error);
        res.status(500).json({ message: "Server error." });
    }
};


// Get all user views (for debugging or analytics purposes)
export const getUserViews = async (req, res) => {
    try {
        const userViews = await UserView.find();
        res.status(200).json(userViews);
    } catch (error) {
        console.error("Error fetching user views:", error);
        res.status(500).json({ message: "Server error." });
    }
};

export default { logUserView, getUserViews };
