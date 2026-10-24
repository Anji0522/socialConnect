import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { clearAuthCookie, setAuthCookie, signToken } from "../utils/auth.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { publicProfile } from "../utils/postMapper.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, name, gender, dob } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    passwordHash,
    name,
    gender: gender || "",
    dob: dob || "",
  });
  setAuthCookie(res, signToken(user.id));
  res.status(201).json({ user: await publicProfile(user, user.id) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) throw new AppError(401, "Invalid email or password");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError(401, "Invalid email or password");
  setAuthCookie(res, signToken(user.id));
  const fresh = await User.findById(user._id);
  res.json({ user: await publicProfile(fresh, fresh.id) });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: await publicProfile(req.user, req.user.id) });
});
