import Joi from "joi";
import { PromoterManagerRequest } from "../types/request";
import { CreateEventRequestBody, DeleteEventRequestParams, GetEventExpensesRequestParams, UpdateEventRequestBody, UpdateEventRequestParams } from "../types/event";

// Schema per la creazione di un nuovo evento
export const createEventSchema = Joi.object<PromoterManagerRequest<unknown, CreateEventRequestBody>>({
  body: Joi.object<CreateEventRequestBody>({
    titolo: Joi.string().required().messages({
      "string.empty": "Il titolo è obbligatorio",
    }),
    descrizione: Joi.string().allow(null, ""),
    data_inizio: Joi.date().required().messages({
      "date.base": "La data di inizio è obbligatoria",
    }),
    data_fine: Joi.date().required().messages({
      "date.base": "La data di fine è obbligatoria",
    }),
    teamId: Joi.number().optional(),
  }),
});

// Schema per l'aggiornamento di un evento esistente
export const updateEventSchema = Joi.object<
  PromoterManagerRequest<UpdateEventRequestParams, UpdateEventRequestBody>
>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
  body: Joi.object({
    titolo: Joi.string().allow(null, ""),
    descrizione: Joi.string().allow(null, ""),
    data_inizio: Joi.date().allow(null),
    data_fine: Joi.date().allow(null),
    nota: Joi.string().allow(null, ""),
  }),
});

// Schema per l'eliminazione di un evento
export const deleteEventSchema = Joi.object<
  PromoterManagerRequest<DeleteEventRequestParams>
>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});

// Schema per ottenere le spese associate a un evento
export const getEventExpensesSchema = Joi.object<
  PromoterManagerRequest<GetEventExpensesRequestParams>
>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});
