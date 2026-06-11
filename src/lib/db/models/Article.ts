import { Schema, model, models, Types } from "mongoose";

const ArticleSchema = new Schema(
  {
    title:         { type: String, required: true, trim: true },
    slug:          { type: String, required: true, unique: true, lowercase: true },
    excerpt:       { type: String, required: true, maxlength: 500 },
    // Mixed: stores Lexical JSON (Payload CMS) or plain HTML string (legacy)
    content:       { type: Schema.Types.Mixed, required: true },
    // HTML version of content — auto-populated by Payload beforeChange hook
    contentHtml:   { type: String, default: "" },
    // Hindi translation fields (optional)
    title_hi:       { type: String, default: "" },
    excerpt_hi:     { type: String, default: "" },
    contentHtml_hi: { type: String, default: "" },
    featuredImage: { type: String, default: "" },
    category:      { type: Types.ObjectId, ref: "Category", required: true },
    tags:          { type: [String], default: [] },
    author:        { type: Types.ObjectId, ref: "Author", required: true },
    status:        { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    aiSummary:     { type: String, default: "" },
    readingTime:   { type: Number, default: 3 },
    views:         { type: Number, default: 0 },
    viewsByDate:   { type: Map, of: Number, default: {} },  // daily view counts: { '2026-05-22': 45 }
    commentCount:  { type: Number, default: 0 },            // approved comments count (denormalized)
    publishedAt:   { type: Date, default: null },
    tweetId:       { type: String, default: '' },
    reactions: {
      like:  { type: Number, default: 0 },
      love:  { type: Number, default: 0 },
      fire:  { type: Number, default: 0 },
      wow:   { type: Number, default: 0 },
    },
    // SEO overrides managed via Payload CMS admin
    seo: {
      metaTitle:       { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      ogImage:         { type: String, default: "" },
      canonicalUrl:    { type: String, default: "" },
      noIndex:         { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

ArticleSchema.index({ category: 1, publishedAt: -1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ views: -1 });

export default models.Article || model("Article", ArticleSchema);
