import Favorite from "../models/Favorite.js";

export const addFavoriteProperty = async (req, res) => {
    const { propertyId } = req.body;

    try {
        const existingFavorite = await Favorite.findOne({ userId: req.userId, propertyId });

        if (existingFavorite) {
            return res.status(400).json({ message: "Property is already in favorites." });
        }

        const newFavorite = new Favorite({ userId: req.userId, propertyId });
        await newFavorite.save();

        res.status(201).json({ message: "Property added to favorites." });
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.userId }).populate("propertyId");
        res.status(200).json(favorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ message: "Server error" });
    }
};
