import { Schema, model, models } from "mongoose";

const AuthorSchema = new Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true },
    bio:       { type: String, default: "" },
    avatar:    { type: String, default: "" },
    twitter:   { type: String, default: "" },
    linkedin:  { type: String, default: "" },
    expertise: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default models.Author || model("Author", AuthorSchema);
