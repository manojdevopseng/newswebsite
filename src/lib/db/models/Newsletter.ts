import { Schema, model, models } from "mongoose";

const NewsletterSchema = new Schema(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    status:       { type: String, enum: ["active", "unsubscribed"], default: "active" },
    source:       { type: String, default: "website" },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Newsletter || model("Newsletter", NewsletterSchema);
