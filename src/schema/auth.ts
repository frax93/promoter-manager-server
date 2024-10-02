import Joi from "joi";
import {
  RegistrationBody,
  LoginBody,
  VerificaUtenzaBody,
  ResetPasswordBody,
} from "../types/auth";
import { PromoterManagerRequest } from "../types/request";
import { jwtRegex } from "../constants/regex";
import { validateToken } from "../utils/validate-token";

export const registrationSchema = Joi.object<PromoterManagerRequest<RegistrationBody>>(
  {
    body: Joi.object<RegistrationBody>({
      nome: Joi.string().min(3).required().messages({
        "string.base": `"nome" deve essere una stringa`,
        "string.empty": `"nome" non può essere vuoto`,
        "string.min": `"nome" deve avere almeno {#limit} caratteri`,
        "any.required": `"nome" è un campo obbligatorio`,
      }),
      email: Joi.string().email().required().messages({
        "string.base": `"email" deve essere una stringa`,
        "string.email": `"email" non è valida`,
        "any.required": `"email" è un campo obbligatorio`,
      }),
      password: Joi.string().min(6).required().messages({
        "string.base": `"password" deve essere una stringa`,
        "string.empty": `"password" non può essere vuota`,
        "string.min": `"password" deve avere almeno {#limit} caratteri`,
        "any.required": `"password" è un campo obbligatorio`,
      }),
      token: Joi.string().optional().messages({
        "string.base": `"token" deve essere una stringa`,
      }),
    }),
  }
);

// Schema di validazione per il login
export const loginSchema = Joi.object<PromoterManagerRequest<LoginBody>>({
  body: Joi.object<LoginBody>({
    email: Joi.string().email().required().messages({
      "string.base": `"email" deve essere una stringa`,
      "string.email": `"email" non è valida`,
      "any.required": `"email" è un campo obbligatorio`,
    }),
    password: Joi.string().min(6).required().messages({
      "string.base": `"password" deve essere una stringa`,
      "string.empty": `"password" non può essere vuota`,
      "string.min": `"password" deve avere almeno {#limit} caratteri`,
      "any.required": `"password" è un campo obbligatorio`,
    }),
    token2FA: Joi.string().optional().messages({
      "string.base": `"token2FA" deve essere una stringa`,
    }),
  }),
});

// Schema di validazione per la verifica utenza
export const verificaUtenzaSchema = Joi.object<
  PromoterManagerRequest<VerificaUtenzaBody>
>({
  body: Joi.object<VerificaUtenzaBody>({
    email: Joi.string().email().required().messages({
      "string.base": `"email" deve essere una stringa`,
      "string.email": `"email" non è valida`,
      "any.required": `"email" è un campo obbligatorio`,
    }),
    password: Joi.string().min(6).required().messages({
      "string.base": `"password" deve essere una stringa`,
      "string.empty": `"password" non può essere vuota`,
      "string.min": `"password" deve avere almeno {#limit} caratteri`,
      "any.required": `"password" è un campo obbligatorio`,
    }),
  }),
});

// Schema di validazione per il reset della password
export const resetPasswordSchema = Joi.object<
  PromoterManagerRequest<ResetPasswordBody>
>({
  body: Joi.object<ResetPasswordBody>({
    email: Joi.string().email().required().messages({
      "string.base": `"email" deve essere una stringa`,
      "string.email": `"email" non è valida`,
      "any.required": `"email" è un campo obbligatorio`,
    }),
  }),
});

// Schema di validazione per il reset della password
export const confirmEmailSchema = Joi.object<
  PromoterManagerRequest<{ token: string }>
>({
  params: Joi.object<{ token: string }>({
    token: Joi.string()
      .required()
      .custom(validateToken, "Validazione jwt")
      .pattern(jwtRegex)
      .messages({
        "string.base": `"token" deve essere una stringa`,
        "string.pattern.base": `"token" non valido`,
        "any.invalid": `"token" non valido`,
        "any.required": `"token" è un campo obbligatorio`,
      }),
  }),
});

export default {
  loginSchema,
  registrationSchema,
  verificaUtenzaSchema,
  resetPasswordSchema,
};
