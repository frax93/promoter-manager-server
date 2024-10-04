import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { __JWT_SECRET__ } from "../constants/environment";
import { JwtUser } from "../models/jwt-user";
import { logger } from "../utils/logger";
import { UnauthanteticatedError } from "../errors/unauthenticated-error";

const jwtMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Recupera il token dall'header di autorizzazione
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      throw new UnauthanteticatedError("Accesso negato");
    }

    try {
      // Verifica il token
      const decoded = jwt.verify(
        token,
        __JWT_SECRET__
      ) as JwtUser;
      req.user = decoded; // Salva i dati decodificati (ad es. userId) nella richiesta

      logger.info(`${req.user} utente loggato`);
      next();
    } catch (err) {
      throw new UnauthanteticatedError("Token non valido");
    }
  };
};

export default jwtMiddleware;
