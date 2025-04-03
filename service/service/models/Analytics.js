import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            unique: true, // Ensure each property has only one analytics entry
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Static method to increment views
analyticsSchema.statics.incrementViews = async function (propertyId) {
    try {
        const analytics = await this.findOneAndUpdate(
            { propertyId }, // Find the analytics entry for the property
            { $inc: { views: 1 } }, // Increment the views
            { new: true, upsert: true } // Create entry if it doesn't exist
        );
        return analytics;
    } catch (error) {
        console.error("Error incrementing views in analytics:", error);
        throw new Error("Failed to increment views.");
    }
};

export default mongoose.model("Analytics", analyticsSchema);


// correct
// import { Schema, model } from 'mongoose';

// const analyticsSchema = Schema({
//     propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
//     views: { type: Number, required: true },
//     timestamp: { type: Date, default: Date.now },
// });

// export default model('Analytics', analyticsSchema);


// import { Schema, model } from "mongoose";

// const AnalyticsSchema = new Schema({
//     propertyViews: { type: Number, default: 0 },
//     totalSales: { type: Number, default: 0 },
//     userEngagement: { type: Number, default: 0 },
// });

// const Analytics = model("Analytics", AnalyticsSchema);

// export default Analytics;

