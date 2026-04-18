import ApiResponse from "../utils/ApiResponse.js";

export const healthCheck = (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      },
      "Server healthy"
    )
  );
};