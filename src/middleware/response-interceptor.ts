import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const responseInterceptor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSendJson = res.json;

  res.json = function (body: unknown) {
    // Logga la risposta
    logger.info(`Response body:${JSON.stringify(body)}`);

    // Richiama il metodo originale `send` con il corpo della risposta
    return originalSendJson.call(this, body);
  };

  const originalSend = res.send;

  res.send = function (body: unknown) {
    // Logga la risposta
    logger.info(`Response body:${JSON.stringify(body)}`);

    // Richiama il metodo originale `send` con il corpo della risposta
    return originalSend.call(this, body);
  };

  next();
};