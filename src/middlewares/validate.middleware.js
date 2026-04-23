import ApiError from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(new ApiError(400, messages[0], messages));
  }
  next();
};