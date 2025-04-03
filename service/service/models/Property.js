// src/models/Property.js
import { Schema, model } from "mongoose";

const propertySchema = new Schema(
    {
        title: { type: String, required: true },
        type: { type: String, required: true },
        price: { type: Number, required: true },
        rentPerMonth: { type: Number, default: null },
        location: { type: String, required: true },
        coordinates: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], required: true },
        },
        description: { type: String },
        images: { type: [String], required: true },
        facilities: [
            {
                name: { type: String, required: true },
                value: { type: String, required: true },
                icon: { type: String, default: null },
            },
        ],
        // Removed contactNumber field
    },
    { timestamps: true }
);

propertySchema.index({ coordinates: "2dsphere" });

export default model("Property", propertySchema);