import Joi from "joi";
import jwt from "jsonwebtoken";
import { __JWT_SECRET__ } from "../constants/environment";

export const validateToken = (value: string, helpers: Joi.CustomHelpers) => {
  // Verifica la validità del token usando jwt.verify
  try {
    jwt.verify(value, __JWT_SECRET__);
  } catch (error) {
    return helpers.error("any.invalid", { value, message: "Token non valido" });
  }

  // Se il token è valido, restituisce il valore
  return value;
};
