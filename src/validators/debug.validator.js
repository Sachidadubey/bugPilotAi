import Joi from "joi";

const SUPPORTED_LANGUAGES = [
  "javascript","typescript","python","java","c","cpp","csharp",
  "go","rust","ruby","php","swift","kotlin","bash","sql",
  "html","css","json","yaml","other","unknown",
];

export const analyzeSchema = Joi.object({
  inputType: Joi.string().valid("text","code","image","log").required(),
  textInput: Joi.when("inputType", {
    is:        Joi.valid("text","code","log"),
    then:      Joi.string().min(5).max(10000).required(),
    otherwise: Joi.string().optional().allow(""),
  }),
  language: Joi.string().valid(...SUPPORTED_LANGUAGES).default("unknown"),
  mode:     Joi.string().valid("analyze","fix","optimize").default("analyze"),
});