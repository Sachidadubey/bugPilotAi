import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.js";

// Lazy config — called at request time, not module load time
const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
  return cloudinary;
};

export const uploadToCloudinary = async (localFilePath, folder = "bugpilot/debug") => {
  try {
    const cld    = getCloudinary();
    const result = await cld.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
    });
    logger.info(`Cloudinary upload success: ${result.public_id}`);
    return result;
  } catch (err) {
    logger.error(`Cloudinary upload failed: ${err.message}`);
    throw err;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const cld = getCloudinary();
    await cld.uploader.destroy(publicId);
    logger.info(`Cloudinary delete: ${publicId}`);
  } catch (err) {
    logger.error(`Cloudinary delete failed: ${err.message}`);
  }
};