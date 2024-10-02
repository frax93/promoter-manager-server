import { Response, NextFunction } from "express";
import Joi, { ValidationErrorItem } from "joi";
import { isEmptyObject } from "./is-empty-object";
import { PromoterManagerRequest } from "../types/request";



// Middleware di validazione
const validateBody = <T,Y>(schema: Joi.Schema, req: PromoterManagerRequest<T, Y>) => {
  const { error: bodyError } = schema.extract("body").validate(req.body, {
    abortEarly: false,
  });

  const errors = [];

  if (bodyError) {
    errors.push(
      ...bodyError.details.map((detail) => ({ message: detail.message }))
    );
  }

  return errors;
};

const validateParams = <T,Y>(schema: Joi.Schema, req: PromoterManagerRequest<T, Y>) => {
  const { error: paramsError } = schema.extract("params").validate(req.params, {
    abortEarly: false,
  });

  const errors = [];

  if (paramsError) {
    errors.push(
      ...paramsError.details.map((detail) => ({ message: detail.message }))
    );
  }

  return errors;
};

export const validateRequest = <T,Y = unknown>(schema: Joi.Schema) => {
  return (req: PromoterManagerRequest<T, Y>, res: Response, next: NextFunction) => {
    let errors: Partial<ValidationErrorItem>[] = [];

    if (req.body && !isEmptyObject(req.body)) {
      const bodyErrors = validateBody(schema, req);
      errors = errors.concat(...bodyErrors);
    }

    if (req.params && !isEmptyObject(req.params)) {
      const paramsErrors = validateParams(schema, req);
      errors = errors.concat(...paramsErrors);
    }

    if (errors.length > 0) {
      // Ritorna tutti gli errori trovati
      return res.status(400).json({ errors });
    }

    // Se non ci sono errori, passa al prossimo middleware/handler
    next();
  };
};
