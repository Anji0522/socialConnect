import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: "", maxlength: 280 },
    location: { type: String, default: "", maxlength: 80 },
    website: { type: String, default: "", maxlength: 120 },
    gender: { type: String, enum: ["male", "female", "custom", "prefer_not_to_say", ""], default: "" },
    dob: { type: String, default: "" },
    isPrivate: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },

    // Security & Verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // Social safety (blocks and mutes)
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    mutedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

userSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.verificationToken;
    delete ret.verificationExpires;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
