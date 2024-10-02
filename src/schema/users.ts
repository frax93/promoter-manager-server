import Joi from "joi";
import { PromoterManagerRequest, PromoterManagerRequestBody } from "../types/request";
import { AvailabilityBody, ChangePasswordBody, GetUserParams, UpdateUserBody, UpdateUserParams } from "../types/users";

// Schema di validazione per recuperare un utente per ID
export const getUserSchema = Joi.object<PromoterManagerRequest<GetUserParams>>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});

// Schema di validazione per aggiornare un utente
export const updateUserSchema = Joi.object<
  PromoterManagerRequest<UpdateUserParams, UpdateUserBody>
>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
  body: Joi.object({
    referralLink: Joi.string().allow("").optional(), // Link di referral (opzionale)
    linkAzienda: Joi.string().allow("").optional(), // Link azienda (opzionale)
    linkVideo: Joi.string().allow("").optional(), // Link video (opzionale)
  }),
});

// Schema di validazione per la disponibilità
export const availabilitySchema = Joi.object<
  PromoterManagerRequestBody<AvailabilityBody>
>({
  body: Joi.object({
    emails: Joi.array().items(Joi.string().email()).optional(), // Array di email
    token: Joi.string().required(), // Token (richiesto)
  }),
});

// Schema di validazione per il cambio password
export const changePasswordSchema = Joi.object<
  PromoterManagerRequestBody<ChangePasswordBody>
>({
  body: Joi.object({
    password: Joi.string().min(6).required(), // Password (richiesta e di almeno 6 caratteri)
  }),
});
