import Joi from "joi";
import { PromoterManagerRequestBody } from "../types/request";
import { CreateUsefulLinkBody } from "../types/useful-links";

// Schema di validazione per la creazione del team
export const createUsefulLinkSchema = Joi.object<
  PromoterManagerRequestBody<CreateUsefulLinkBody>
>({
  body: Joi.object({
    links: Joi.array().items({}).required().messages({
      "any.required": "Il parametro 'links' è obbligatorio",
    }),
  }),
});