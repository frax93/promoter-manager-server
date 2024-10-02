import Joi from "joi";
import {
  PromoterManagerRequest,
  PromoterManagerRequestBody,
} from "../types/request";
import {
  CreateNoteBody,
  DeleteNoteParams,
  GetNoteParams,
  MarkAsCompleteBody,
  UpdateNoteBody,
  UpdateNoteParams,
} from "../types/note";

// Schema di validazione per la creazione delle note
export const createNoteSchema = Joi.object<
  PromoterManagerRequestBody<CreateNoteBody>
>({
  body: Joi.object<CreateNoteBody>({
    contenuto: Joi.string().required().messages({
      "string.empty": "Il campo è obbligatorio",
    }),
    token: Joi.string().optional(),
    priorita: Joi.number().optional(),
    reminderDate: Joi.date().required().messages({
      "date.base": "La data di fine è obbligatoria",
    }),
  }),
});

// Schema di validazione per l'aggiornamento delle note
export const updateNoteSchema = Joi.object<
  PromoterManagerRequest<UpdateNoteParams, UpdateNoteBody>
>({
  body: Joi.object({
    contenuto: Joi.string().required().messages({
      "string.empty": "Il campo è obbligatorio",
    }),
    token: Joi.string().optional(),
    priorita: Joi.number().optional(),
    reminderDate: Joi.date().required().messages({
      "date.base": "La data di fine è obbligatoria",
    }),
  }),
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});

// Schema di validazione per l'aggiornamento delle note
export const markCompleteNoteSchema = Joi.object<
  PromoterManagerRequest<UpdateNoteParams, MarkAsCompleteBody>
>({
  body: Joi.object({
    completed: Joi.bool().required(),
  }),
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});

// Schema di validazione per la cancellazione delle note
export const deleteNoteSchema = Joi.object<PromoterManagerRequest<DeleteNoteParams>>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});

// Schema di validazione per la get delle note
export const getNoteSchema = Joi.object<PromoterManagerRequest<GetNoteParams>>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});
