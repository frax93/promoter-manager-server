import { NextFunction, Request, Response } from "express";
import { GenericError } from "../errors/generic-error";
import { logger } from "../utils/logger";
import { StatusCode } from "../constants/status-code";
import { BaseError } from "sequelize";

export const errorInterceptor = (
  err: GenericError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack }); // Logga l'errore

  // Cattura gli errori del database
  if (err instanceof BaseError || err instanceof Error) {
    return res.status(StatusCode.InternalServer).json({
      message: "Errore interno al server",
    });
  }

  return res.status(err.code || StatusCode.InternalServer).json({
    message: err.errors ? undefined : err.message || "Errore interno al server",
    errors: err.errors,
  }); // Rispondi con un messaggio generico
};