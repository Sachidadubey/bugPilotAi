import fs   from "fs";
import path from "path";
import logger from "../config/logger.js";

const TEMP_DIR    = "public/temp";
const MAX_AGE_MS  = 60 * 60 * 1000; // 1 hour

export const cleanTempFiles = () => {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;

    const files = fs.readdirSync(TEMP_DIR);
    const now   = Date.now();
    let deleted = 0;

    for (const file of files) {
      if (file === ".gitkeep") continue;
      const filePath = path.join(TEMP_DIR, file);
      const stat     = fs.statSync(filePath);

      if (now - stat.mtimeMs > MAX_AGE_MS) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }

    if (deleted > 0) logger.info(`Cleaned ${deleted} temp files`);
  } catch (err) {
    logger.error(`Temp cleanup failed: ${err.message}`);
  }
};