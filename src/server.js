// ES module imports hoist hote hain, isliye dotenv ko
// sab se pehle load karne ka sahi tarika:
import { config } from "dotenv";
config();  // synchronous — yahan tak sab env loaded

import logger          from "./config/logger.js";
import connectDB       from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import app from "./app.js";
import { initGemini }    from "./config/gemini.js";

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
      initGemini();  
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error(`Server startup failed: ${err.message}`);
    process.exit(1);
  }
};

startServer();