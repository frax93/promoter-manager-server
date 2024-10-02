import Joi from "joi";
import {
  CreateExpenseRequestBody,
  DeleteExpenseRequestParams,
  UpdateExpenseRequestBody,
  UpdateExpenseRequestParams,
} from "../types/expense";
import { PromoterManagerRequest } from "../types/request";

// Schema per la creazione di una spesa
export const createExpenseSchema = Joi.object<
  PromoterManagerRequest<undefined, CreateExpenseRequestBody>
>({
  body: Joi.object<CreateExpenseRequestBody>().keys({
    descrizione: Joi.string().required().messages({
      "string.empty": "La descrizione è obbligatoria",
    }),
    importo: Joi.number().required().positive().messages({
      "number.base": "L'importo deve essere un numero",
      "number.empty": "L'importo è obbligatorio",
      "number.positive": "L'importo deve essere positivo",
    }),
    tipoId: Joi.number().optional(),
    guadagno_spesa: Joi.boolean().required().messages({
      "any.required": "Il campo guadagno_spesa è obbligatorio",
    }),
    tipo_importo: Joi.string().required().messages({
      "string.empty": "Il tipo di importo è obbligatorio",
    }),
  }),
});

// Schema per l'aggiornamento di una spesa
export const updateExpenseSchema = Joi.object<
  PromoterManagerRequest<UpdateExpenseRequestParams, UpdateExpenseRequestBody>
>({
  params: Joi.object<UpdateExpenseRequestParams>().keys({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
  body: Joi.object<UpdateExpenseRequestBody>().keys({
    descrizione: Joi.string().optional(),
    importo: Joi.number().optional().positive().messages({
      "number.base": "L'importo deve essere un numero",
      "number.positive": "L'importo deve essere positivo",
    }),
    tipoId: Joi.number().optional(),
    tipo_importo: Joi.string().optional(),
  }),
});

// Schema per l'eliminazione di una spesa
export const deleteExpenseSchema = Joi.object<
  PromoterManagerRequest<DeleteExpenseRequestParams>
>({
  params: Joi.object<DeleteExpenseRequestParams>().keys({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});
