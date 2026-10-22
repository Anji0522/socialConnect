import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
