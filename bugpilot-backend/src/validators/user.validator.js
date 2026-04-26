

import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name:  Joi.string().min(2).max(50).optional(),
  bio:   Joi.string().max(200).optional().allow(""),
  phone: Joi.string().max(15).optional().allow(""),
});

export const changeEmailSchema = Joi.object({
  newEmail:        Joi.string().email().required(),
  currentPassword: Joi.string().required(),
});