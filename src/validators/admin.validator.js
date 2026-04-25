import Joi from "joi";

export const banUserSchema = Joi.object({
  reason: Joi.string().min(5).max(200).required(),
});

export const updateUserPlanSchema = Joi.object({
  subscription: Joi.string().valid("free", "pro").required(),
});

export const getUsersSchema = Joi.object({
  page:         Joi.number().min(1).default(1),
  limit:        Joi.number().min(1).max(100).default(20),
  search:       Joi.string().optional().allow(""),
  subscription: Joi.string().valid("free","pro").optional(),
  isVerified:   Joi.boolean().optional(),
  isBanned:     Joi.boolean().optional(),
  sortBy:       Joi.string().valid("createdAt","name","email").default("createdAt"),
  order:        Joi.string().valid("asc","desc").default("desc"),
});