// service/service/routers/homeConfigRoutes.js
import express from "express";
import HomeConfig from "../models/HomeConfig.js";

const router = express.Router();

// GET homepage config
router.get("/", async (req, res) => {
    try {
        const config = await HomeConfig.findOne(); // we assume only one config
        if (!config) return res.status(404).json({ message: "Home config not found" });
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Error fetching home config", error: err.message });
    }
});

// Optional: Admin-only update route
router.post("/", async (req, res) => {
    try {
        const { banner, cities } = req.body;

        let config = await HomeConfig.findOne();
        if (!config) {
            config = new HomeConfig({ banner, cities });
        } else {
            config.banner = banner;
            config.cities = cities;
        }

        await config.save();
        res.json({ message: "Home config saved", config });
    } catch (err) {
        res.status(500).json({ message: "Error saving home config", error: err.message });
    }
});

export default router;
