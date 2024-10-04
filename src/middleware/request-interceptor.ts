import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { responseInterceptor } from "./response-interceptor";

export const requestInterceptor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info(`Request: ${req.method} ${req.url}`); // Log della richiesta
  logger.info(`Body: ${req.body ? JSON.stringify(req.body) : ""}`); // Log della richiesta
  logger.info(`Query: ${req.query ? JSON.stringify(req.query) : ""}`); // Log della richiesta
  logger.info(`Params: ${req.params ? JSON.stringify(req.params) : ""}`); // Log della richiesta

  responseInterceptor(req, res, next);
};