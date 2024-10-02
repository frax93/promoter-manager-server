import Joi from "joi";
import { PromoterManagerRequest } from "../types/request";
import { GetEventsByCalendarIdRequestParams } from "../types/calendar";

// Schema per i parametri della rotta che recupera gli eventi associati a un calendario
export const getEventsByCalendarIdSchema = Joi.object<
  PromoterManagerRequest<GetEventsByCalendarIdRequestParams>
>({
  params: Joi.object<GetEventsByCalendarIdRequestParams>({
    id: Joi.number().integer().required().messages({
      "any.required": "Il parametro 'id' è obbligatorio",
      "number.base": "'id' deve essere un numero intero",
    }),
  }),
});

