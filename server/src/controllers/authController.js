import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import {
  clearAuthCookies,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
} from "../utils/auth.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { publicProfile } from "../utils/postMapper.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/mailer.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, name, gender, dob } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    passwordHash,
    name,
    gender: gender || "",
    dob: dob || "",
    isVerified: false,
    verificationToken,
    verificationExpires,
  });

  // Send verification email in background
  sendVerificationEmail(user.email, verificationToken).catch((err) =>
    console.error("[Mailer] Register email error:", err),
  );

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: await publicProfile(user, user.id),
    accessToken,
    refreshToken,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) throw new AppError(401, "Invalid email or password");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError(401, "Invalid email or password");

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  setAuthCookies(res, accessToken, refreshToken);

  const fresh = await User.findById(user._id);
  res.json({
    user: await publicProfile(fresh, fresh.id),
    accessToken,
    refreshToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  if (!token) throw new AppError(401, "Refresh token required");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError(401, "Refresh token expired or invalid");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError(401, "User no longer exists");

  const newAccessToken = signAccessToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);
  setAuthCookies(res, newAccessToken, newRefreshToken);

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: await publicProfile(req.user, req.user.id) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });

  // Generic message always returned to prevent user enumeration attacks
  const responseMsg = "If an account with that email exists, reset instructions have been sent.";
  if (!user) {
    return res.json({ message: responseMsg });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  sendPasswordResetEmail(user.email, resetToken).catch((err) =>
    console.error("[Mailer] Forgot password error:", err),
  );

  return res.json({ message: responseMsg });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new AppError(400, "Token and new password are required");

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    throw new AppError(400, "Password reset token is invalid or has expired");
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.json({ message: "Password has been reset successfully. Please log in." });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token || req.query.token;
  if (!token) throw new AppError(400, "Verification token required");

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: new Date() },
  }).select("+verificationToken +verificationExpires");

  if (!user) {
    throw new AppError(400, "Verification token is invalid or has expired");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save();

  return res.json({ message: "Email verified successfully!" });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });

  if (user && !user.isVerified) {
    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    sendVerificationEmail(user.email, token).catch((err) =>
      console.error("[Mailer] Resend verification error:", err),
    );
  }

  return res.json({ message: "If your account is unverified, a new verification link has been sent." });
});
