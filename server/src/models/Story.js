import mongoose, { Schema } from "mongoose";

const storySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  mediaUrl: { type: String, required: true },
  reactions: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      emoji: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// TTL index to automatically purge stories when expiresAt is reached
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ userId: 1, expiresAt: 1 });

storySchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Story = mongoose.model("Story", storySchema);
