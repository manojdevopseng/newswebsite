import { Schema, model, models } from "mongoose";

const AIToolSchema = new Schema(
  {
    name:           { type: String, required: true, trim: true },
    slug:           { type: String, required: true, unique: true, lowercase: true },
    description:    { type: String, required: true },
    tagline:        { type: String, default: "" },
    category:       { type: String, required: true },
    pricing:        { type: String, enum: ["free", "freemium", "paid", "enterprise"], default: "freemium" },
    pricingDetails: { type: String, default: "" },
    features:       { type: [String], default: [] },
    pros:           { type: [String], default: [] },
    cons:           { type: [String], default: [] },
    rating:         { type: Number, min: 0, max: 5, default: 0 },
    website:        { type: String, default: "" },
    logo:           { type: String, default: "" },
    lastReviewed:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AIToolSchema.index({ category: 1 });
AIToolSchema.index({ rating: -1 });

export default models.AITool || model("AITool", AIToolSchema);
