import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        query: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("SearchHistory", searchHistorySchema);
