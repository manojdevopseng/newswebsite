import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name:            { type: String, required: true, trim: true },
    slug:            { type: String, required: true, unique: true, lowercase: true },
    description:     { type: String, default: "" },
    color:           { type: String, default: "#60a5fa" },
    icon:            { type: String, default: "" },
    featuredImage:   { type: String, default: "" },
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Category || model("Category", CategorySchema);
