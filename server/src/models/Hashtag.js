import mongoose from "mongoose";

const hashtagSchema = new mongoose.Schema({
  tag: { type: String, required: true, unique: true, lowercase: true, trim: true },
  postCount: { type: Number, default: 0 },
});

export const Hashtag = mongoose.model("Hashtag", hashtagSchema);
