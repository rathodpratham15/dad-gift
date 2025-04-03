// src/controllers/propertyController.js
import Property from "../models/Property.js";
import Analytics from "../models/Analytics.js";

export const getAllProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, minPrice, maxPrice, query, propertyType, city } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: "i" } },
                { location: { $regex: query, $options: "i" } },
            ];
        }
        if (propertyType) filter.type = propertyType;
        if (city) filter.location = { $regex: city, $options: "i" };
        if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

        const properties = await Property.find(filter).skip(skip).limit(parseInt(limit)).lean();
        const analytics = await Analytics.find({ propertyId: { $in: properties.map((p) => p._id) } });
        const propertiesWithViews = properties.map((property) => {
            const viewsData = analytics.find(
                (record) => record.propertyId.toString() === property._id.toString()
            );
            return { ...property, views: viewsData ? viewsData.views : 0 };
        });

        const total = await Property.countDocuments(filter);
        res.status(200).json({ properties: propertiesWithViews, total });
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPropertyById = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Property ID is required." });

    try {
        const property = await Property.findById(id).lean();
        if (!property || !property.coordinates?.coordinates) {
            return res.status(404).json({ message: "Property not found or missing coordinates." });
        }
        const analytics = await Analytics.findOne({ propertyId: id });
        property.views = analytics ? analytics.views : 0;
        res.status(200).json(property);
    } catch (error) {
        console.error("Error fetching property:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getSimilarProperties = async (req, res) => {
    const { id } = req.params;
    const radiusInMiles = req.query.radius ? parseFloat(req.query.radius) : 5;

    try {
        const currentProperty = await Property.findById(id).lean();
        if (!currentProperty) return res.status(404).json({ message: "Property not found." });
        if (!currentProperty.coordinates?.coordinates) {
            return res.status(400).json({ message: "Property is missing valid coordinates." });
        }

        const [longitude, latitude] = currentProperty.coordinates.coordinates;
        const priceRange = 0.1; // ±10%
        const minPrice = currentProperty.price * (1 - priceRange);
        const maxPrice = currentProperty.price * (1 + priceRange);
        const radiusInMeters = radiusInMiles * 1609.34; // Convert miles to meters

        const similarByLocation = await Property.find({
            _id: { $ne: id },
            coordinates: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: radiusInMeters,
                },
            },
        })
            .limit(4)
            .lean();

        const similarByPrice = await Property.find({
            _id: { $ne: id },
            price: { $gte: minPrice, $lte: maxPrice },
            coordinates: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: radiusInMeters,
                },
            },
        })
            .limit(4)
            .lean();

        const analytics = await Analytics.find({
            propertyId: { $in: [...similarByLocation, ...similarByPrice].map((p) => p._id) },
        });

        const mapViews = (properties) =>
            properties.map((property) => {
                const viewsData = analytics.find(
                    (record) => record.propertyId.toString() === property._id.toString()
                );
                return { ...property, views: viewsData ? viewsData.views : 0 };
            });

        res.status(200).json({
            similarByLocation: mapViews(similarByLocation),
            similarByPrice: mapViews(similarByPrice),
        });
    } catch (error) {
        console.error("Error fetching similar properties:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const addProperty = async (req, res) => {
    try {
        const {
            title,
            type,
            price,
            rentPerMonth,
            location,
            coordinates,
            description,
            images,
            facilities,
            // Removed contactNumber
        } = req.body;

        if (!title || !type || !price || !location || !images || images.length === 0 || !coordinates) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        if (!Array.isArray(facilities) || facilities.some((fac) => !fac.name || !fac.value)) {
            return res.status(400).json({ message: "Invalid facilities format" });
        }

        const newProperty = new Property({
            title,
            type,
            price: parseFloat(price),
            rentPerMonth: rentPerMonth ? parseFloat(rentPerMonth) : null,
            location,
            coordinates,
            description,
            images,
            facilities,
            // Removed contactNumber
        });

        await newProperty.save();
        res.status(201).json({ message: "Property added successfully", property: newProperty });
    } catch (error) {
        console.error("Error adding property:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteProperty = async (req, res) => {
    if (req.role !== "admin") return res.status(403).json({ message: "Access denied: Admins only" });

    const { id } = req.params;
    try {
        const deletedProperty = await Property.findByIdAndDelete(id);
        if (!deletedProperty) return res.status(404).json({ message: "Property not found" });
        res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
        console.error("Error deleting property:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateProperty = async (req, res) => {
    if (req.role !== "admin") return res.status(403).json({ message: "Access denied: Admins only" });

    const { id } = req.params;
    const {
        title,
        type,
        price,
        rentPerMonth,
        location,
        coordinates,
        description,
        images,
        facilities,
        // Removed contactNumber
    } = req.body;

    try {
        const updateData = {
            title,
            type,
            price: parseFloat(price),
            rentPerMonth: rentPerMonth ? parseFloat(rentPerMonth) : null,
            location,
            coordinates,
            description,
            facilities,
            // Removed contactNumber
        };
        if (images) updateData.images = images;

        const updatedProperty = await Property.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedProperty) return res.status(404).json({ message: "Property not found" });
        res.status(200).json({ message: "Property updated successfully", property: updatedProperty });
    } catch (error) {
        console.error("Error updating property:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded." });
        }
        const filePaths = req.files.map((file) => `/uploads/${file.filename}`);
        res.status(200).json({ filePaths });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ message: "Server error during image upload.", error: error.message });
    }
};

export default {
    getAllProperties,
    getPropertyById,
    addProperty,
    deleteProperty,
    updateProperty,
    uploadImages,
    getSimilarProperties,
};