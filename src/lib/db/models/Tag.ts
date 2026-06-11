import { Schema, model, models } from "mongoose";

const TagSchema = new Schema(
  {
    name:         { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true },
    articleCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Tag || model("Tag", TagSchema);
