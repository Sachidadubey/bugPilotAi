import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
});

export const changeEmailSchema = Joi.object({
  newEmail:        Joi.string().email().required(),
  currentPassword: Joi.string().required(),
});