import multer  from "multer";
import path from "path";
import fs       from "fs";  
import { v4 as uuid } from "uuid";
 
import ApiError from "../utils/ApiError.js";

// Ensure temp folder exists on startup — never crash on missing folder
const TEMP_DIR = "public/temp";
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "public/temp"),
  // uuid prevents filename collision + directory traversal attacks
  filename:    (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/png", "image/webp"];
  const allowedLogs   = ["text/plain"];

  if ([...allowedImages, ...allowedLogs].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} not supported`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});