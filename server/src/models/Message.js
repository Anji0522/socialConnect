import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, default: "", trim: true },
    mediaUrl: { type: String, default: "" },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

messageSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Message = mongoose.model("Message", messageSchema);
