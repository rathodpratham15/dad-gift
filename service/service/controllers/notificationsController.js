// controllers/notificationsController.js

export const getNotifications = async (req, res) => {
    try {
        const dummyNotifications = [
            {
                id: "notif-" + Date.now(), // Randomized for now (optional)
                message: "🏡 New 2BHK added in Andheri!",
                type: "info",
                createdAt: new Date(),
            },
        ];

        res.status(200).json(dummyNotifications);
    } catch (error) {
        console.error("❌ Notification fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
