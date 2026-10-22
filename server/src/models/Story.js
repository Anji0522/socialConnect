import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  mediaUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
});

storySchema.index({ userId: 1, expiresAt: 1 });

export const Story = mongoose.model("Story", storySchema);
