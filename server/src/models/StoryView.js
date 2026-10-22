import mongoose from "mongoose";

const storyViewSchema = new mongoose.Schema(
  {
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
    viewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

storyViewSchema.index({ storyId: 1, viewerId: 1 }, { unique: true });

export const StoryView = mongoose.model("StoryView", storyViewSchema);
