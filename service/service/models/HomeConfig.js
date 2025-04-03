import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true }, // path like /uploads/thane.jpg
});

const bannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    heading: { type: String, required: true },
    subheading: { type: String, required: true },
    ctaText: { type: String, required: true },
    ctaLink: { type: String, required: true },
});

const homeConfigSchema = new mongoose.Schema({
    banner: bannerSchema,
    cities: [citySchema],
});

export default mongoose.model("HomeConfig", homeConfigSchema);
