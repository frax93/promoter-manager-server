import Joi from "joi";
import {
  PromoterManagerRequest,
  PromoterManagerRequestBody,
} from "../types/request";
import {
  CreateTeamBody,
  DeleteTeamParams,
  GetTeamParams,
  UpdateTeamBody,
  UpdateTeamParams,
} from "../types/team";

// Schema di validazione per la creazione del team
export const createTeamSchema = Joi.object<
  PromoterManagerRequestBody<CreateTeamBody>
>({
  body: Joi.object({
    nome: Joi.string().required(),
    descrizione: Joi.string().allow(""),
    colore: Joi.string().required(),
    utentiIds: Joi.array().items(Joi.number()).optional(),
  }),
});

// Schema di validazione per l'aggiornamento del team
export const updateTeamSchema = Joi.object<
  PromoterManagerRequest<UpdateTeamParams, UpdateTeamBody>
>({
  body: Joi.object({
    nome: Joi.string().required(),
    descrizione: Joi.string().allow(""),
    colore: Joi.string().required(),
    utentiIds: Joi.array().items(Joi.number()).optional(),
  }),
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});

// Schema di validazione per la cancellazione del team
export const deleteTeamSchema = Joi.object<PromoterManagerRequest<DeleteTeamParams>>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});

// Schema di validazione per la get del team
export const getTeamSchema = Joi.object<PromoterManagerRequest<GetTeamParams>>({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});
