import Analytics from "../models/Analytics.js";
import UserViews from "../models/UserViews.js";

// Get analytics data
export const getAnalytics = async (req, res) => {
    if (req.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }

    try {
        const analytics = await Analytics.aggregate([
            { $group: { _id: "$propertyId", totalViews: { $sum: "$views" } } },
            {
                $lookup: {
                    from: "properties",
                    localField: "_id",
                    foreignField: "_id",
                    as: "propertyDetails",
                },
            },
            { $unwind: "$propertyDetails" },
            {
                $project: {
                    propertyId: "$_id",
                    totalViews: 1,
                    "propertyDetails.title": 1,
                    "propertyDetails.location": 1,
                },
            },
        ]);

        res.status(200).json(analytics);
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Log analytics data
export const logAnalytics = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.userId || null; // Allow null for non-logged-in users

        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required." });
        }

        if (userId) {
            const existingView = await UserViews.findOne({ userId, propertyId });

            if (!existingView) {
                await UserViews.create({ userId, propertyId });
                await Analytics.findOneAndUpdate(
                    { propertyId },
                    { $inc: { views: 1 } },
                    { new: true, upsert: true }
                );
            }
        }

        res.status(201).json({ message: "View logged successfully" });
    } catch (error) {
        console.error("Error logging analytics data:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export default { getAnalytics, logAnalytics };

