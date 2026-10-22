import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    fromId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "DECLINED"], default: "PENDING" },
  },
  { timestamps: true },
);

friendRequestSchema.index({ fromId: 1, toId: 1, status: 1 });

export const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
