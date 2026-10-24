import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { env, isCloudinaryEnabled } from "../config/env.js";
import { AppError, asyncHandler } from "../utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new AppError(400, "No files uploaded");
  const urls = [];

  for (const file of req.files) {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    if (!isImage && !isVideo) {
      throw new AppError(400, "Only image and video uploads are allowed");
    }

    if (isCloudinaryEnabled) {
      const b64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(b64, {
        folder: "socialconnect",
        resource_type: "auto",
      });
      urls.push(result.secure_url);
    } else {
      await fs.mkdir(uploadDir, { recursive: true });
      const ext = path.extname(file.originalname) || (isImage ? ".jpg" : ".mp4");
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      await fs.writeFile(path.join(uploadDir, name), file.buffer);
      urls.push(`/uploads/${name}`);
    }
  }

  res.json({ urls });
});
