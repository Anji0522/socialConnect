import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: "", maxlength: 280 },
    location: { type: String, default: "", maxlength: 80 },
    avatarUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

userSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
