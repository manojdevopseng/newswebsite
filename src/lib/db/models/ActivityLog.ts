import mongoose, { Schema } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    action:      { type: String, required: true },          // e.g. "article.published"
    entityType:  { type: String, required: true },          // "article" | "comment"
    entityId:    { type: String, default: "" },
    entityTitle: { type: String, default: "" },             // human-readable name
    details:     { type: String, default: "" },             // optional extra context
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
