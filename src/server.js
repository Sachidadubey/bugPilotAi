import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";

const startServer = async () => {
  const { default: redis } = await import("./config/redis.js");

  await connectDB();

  await redis.set("startup", "ok");

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();