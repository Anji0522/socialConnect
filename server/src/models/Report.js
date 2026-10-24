import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetUser: { type: Schema.Types.ObjectId, ref: "User" },
    targetPost: { type: Schema.Types.ObjectId, ref: "Post" },
    reason: { type: String, required: true, maxlength: 500 },
    status: { type: String, enum: ["PENDING", "RESOLVED", "DISMISSED"], default: "PENDING" },
  },
  { timestamps: true },
);

reportSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Report = mongoose.model("Report", reportSchema);
