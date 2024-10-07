import Joi from "joi";
import { PromoterManagerRequestBody } from "../types/request";
import { ErrorLogRequestBody } from "../types/error-logs";

// Definizione dello schema di validazione per la richiesta di log degli errori
export const errorLogSchema = Joi.object<
  PromoterManagerRequestBody<ErrorLogRequestBody>
>({
  body: Joi.object({
    error_message: Joi.string().required().messages({
      "any.required": "Il parametro 'error_message' è obbligatorio",
      "string.max": "'error_message' deve essere massimo 500 caratteri",
    }),
    user_id: Joi.number().optional(),
    stack_trace: Joi.string().optional().messages({
      "string.max": "'stack_trace' deve essere massimo 2000 caratteri",
    }),
    app_context: Joi.object().optional(),
    user_agent: Joi.string().optional().messages({
      "string.max": "'user_agent' deve essere massimo 255 caratteri",
    }),
    platform: Joi.string().max(50).optional().messages({
      "string.max": "'platform' deve essere massimo 50 caratteri",
    }),
    app_version: Joi.string().max(20).optional().messages({
      "string.max": "'app_version' deve essere massimo 20 caratteri",
    }),
    severity_level: Joi.string()
      .valid("error", "warning", "info")
      .default("error"),
  }),
});
