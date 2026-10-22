import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    position: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, default: "", maxlength: 2000 },
    hashtags: [{ type: String, lowercase: true, trim: true }],
    media: { type: [mediaSchema], default: [] },
  },
  { timestamps: true },
);

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1, _id: -1 });
postSchema.index({ hashtags: 1 });

export const Post = mongoose.model("Post", postSchema);
