import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

commentSchema.index({ postId: 1, createdAt: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
