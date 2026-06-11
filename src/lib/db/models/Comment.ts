import { Schema, model, models, Types } from "mongoose";

const CommentSchema = new Schema(
  {
    articleId:    { type: Types.ObjectId, ref: "Article",  required: true },
    parentId:     { type: Types.ObjectId, ref: "Comment",  default: null },
    name:         { type: String, required: true, trim: true, maxlength: 60 },
    email:        { type: String, required: true, trim: true, lowercase: true },
    gravatarHash: { type: String, default: "" },   // MD5 of email — safe to expose
    content:      { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    status:       { type: String, enum: ["pending", "approved", "spam"], default: "pending" },
    ip:           { type: String, default: "" },
    likes:        { type: Number, default: 0 },
    pinned:       { type: Boolean, default: false },
    reported:     { type: Boolean, default: false },
    reportCount:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

CommentSchema.index({ articleId: 1, status: 1, createdAt: -1 });
CommentSchema.index({ status: 1, createdAt: -1 });

export default models.Comment || model("Comment", CommentSchema);
