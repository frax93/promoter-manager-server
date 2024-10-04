import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Utente } from "../db-models/user";
import { __JWT_SECRET__ } from "../constants/environment";
import speakeasy from "speakeasy";
import { UserModel } from "../models/user";
import { Model } from "sequelize";
import { generateConfirmationToken } from "../utils/generate-confirmation-token";
import {
  sendConfirmationEmail,
  sendEmail,
  webAppUrl,
} from "../utils/send-email";
import { DateTime } from "luxon";
import { Team } from "../db-models/team";
import { UtenteTeam } from "../db-models/user-team";
import { TeamModel } from "../models/team";
import { clientTeam } from "../constants/client-team";
import { Calendario } from "../db-models/calendar";
import { validateRequest } from "../middleware/validate-schema";
import {
  confirmEmailSchema,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
  verificaUtenzaSchema,
} from "../schema/auth";
import { LoginBody, RegistrationBody, ResetPasswordBody } from "../types/auth";
import {
  PromoterManagerRequest,
  PromoterManagerRequestBody,
} from "../types/request";
import { NotFoundError } from "../errors/not-found-error";
import { BadRequestError } from "../errors/bad-request-error";
import { UnauthanteticatedError } from "../errors/unauthenticated-error";
import { StatusCode } from "../constants/status-code";

const router = express.Router();

// API per verificare utenza
router.post(
  "/verifica-utenza",
  validateRequest(verificaUtenzaSchema),
  async (req: PromoterManagerRequestBody<RegistrationBody>, res: Response, next) => {
    const { email, password } = req.body;

    try {
      const utente: Model<UserModel> | null = await Utente.findOne({
        where: { email },
      });

      if (!utente) {
        throw new NotFoundError("Utente non trovato"); // Passa l'errore al middleware
      }

      const passwordIsValid = await bcrypt.compare(
        password,
        utente.dataValues.password
      );

      if (!passwordIsValid) {
        throw new BadRequestError("Password errata"); // Passa l'errore al middleware
      }

      res.status(StatusCode.Ok).json({
        ...utente.dataValues,
      });
    } catch (error) {
      next(error); // Passa l'errore al middleware di gestione degli errori
    }
  }
);

router.post(
  "/login",
  validateRequest(loginSchema),
  async (
    req: PromoterManagerRequestBody<LoginBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password, token2FA } = req.body;
    try {
      const utente: Model<UserModel> | null = await Utente.findOne({
        where: { email },
      });
      if (!utente) {
        throw new NotFoundError("Non trovato");
      }

      const passwordIsValid = await bcrypt.compare(
        password,
        utente.dataValues.password
      );

      if (!passwordIsValid) {
        throw new UnauthanteticatedError("Password errata");
      }

      if (utente.dataValues.two_factor_enabled && token2FA) {
        // Verifica il codice 2FA
        const verified = speakeasy.totp.verify({
          secret: utente.dataValues.two_factor_secret,
          encoding: "base32",
          token: token2FA,
        });

        if (!verified) {
          throw new BadRequestError("Codice 2FA non valido");
        }
      }

      const token = jwt.sign(
        {
          id: utente.dataValues.id,
          email: utente.dataValues.email,
          name: utente.dataValues.nome,
        },
        __JWT_SECRET__,
        {
          expiresIn: 86400, // 24 ore
        }
      );

      res.status(StatusCode.Ok).json({
        id: utente.dataValues.id,
        email: utente.dataValues.email,
        nome: utente.dataValues.nome,
        accessToken: token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// API per creare un nuovo utente
router.post(
  "/registrazione",
  validateRequest(registrationSchema),
  async (
    req: PromoterManagerRequestBody<RegistrationBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { nome, email, password, token } = req.body;
    try {
      // Verifica se l'email esiste già
      const existingUser = await Utente.findOne({ where: { email } });

      if (existingUser) {
        throw new BadRequestError("L'email è già in uso.");
      }
      // Genera il codice di conferma
      const confirmationToken = generateConfirmationToken();

      const confirmationTokenExpires = DateTime.now()
        .plus({ minutes: 15 })
        .toISO();

      const nuovoUtente: Model<UserModel> = await Utente.create({
        nome,
        email,
        password,
        token_verifica: confirmationToken,
        email_confermata: false,
        scadenza_token: confirmationTokenExpires,
        push_token: token,
      });

      const nuovoTeam: Model<TeamModel> = await Team.create({ ...clientTeam });

      // Associa l'utente al team
      await UtenteTeam.create({
        utente_id: nuovoUtente.dataValues.id,
        team_id: nuovoTeam.dataValues.id,
      });

      await Calendario.create({
        nome: `Calendario ${nome}`,
        descrizione: `Calendario principale per ${nome}`,
        team_id: nuovoTeam.dataValues.id,
      });

      // Invia l'email di conferma
      await sendConfirmationEmail(email, confirmationToken);

      res.status(StatusCode.Ok).json(nuovoUtente.dataValues);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/conferma-email/:token",
  validateRequest(confirmEmailSchema),
  async (
    req: PromoterManagerRequest<{ token: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req.params;

    try {
      // Trova l'utente con il token di conferma
      const user = await Utente.findOne({ where: { token_verifica: token } });

      if (!user) {
        throw new BadRequestError("Token non valido o già utilizzato.");
      }

      // Controlla se il token è scaduto con Luxon
      const now = DateTime.now();
      const tokenExpires = DateTime.fromISO(user.dataValues.scadenza_token);

      if (now > tokenExpires) {
        throw new BadRequestError("Il token di conferma è scaduto.");
      }

      // Aggiorna lo stato dell'utente e rimuovi il token di conferma

      await user.update({
        token_verifica: null,
        email_confermata: true,
        scadenza_token: null,
      });

      res.send("Email confermata con successo! Ora puoi effettuare il login.");
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/reinvia-conferma",
  validateRequest(resetPasswordSchema),
  async (
    req: PromoterManagerRequestBody<ResetPasswordBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { email } = req.body;

    try {
      // Trova l'utente in base all'email
      const user: Model<UserModel> | null = await Utente.findOne({
        where: { email },
      });

      if (!user) {
        throw new NotFoundError("Utente non trovato.");
      }

      if (user.dataValues?.email_confermata) {
        throw new BadRequestError("L'utente ha già confermato l'email.");
      }

      // Genera un nuovo token e una nuova data di scadenza usando Luxon
      const newConfirmationToken = generateConfirmationToken();
      const newConfirmationTokenExpires = DateTime.now()
        .plus({ minutes: 15 })
        .toISO();

      // Aggiorna lo stato dell'utente e mette il token di verifica
      await user.update({
        token_verifica: newConfirmationToken,
        email_confermata: false,
        scadenza_token: newConfirmationTokenExpires,
      });

      // Invia una nuova email di conferma
      await sendConfirmationEmail(email, newConfirmationToken);

      res
        .status(StatusCode.Ok)
        .send(
          "Nuova email di conferma inviata. Controlla la tua casella di posta."
        );
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  async (
    req: PromoterManagerRequestBody<ResetPasswordBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { email } = req.body;
    try {
      const user: Model<UserModel> | null = await Utente.findOne({
        where: { email },
      });
      // Genera il JWT
      const token = jwt.sign(
        {
          id: user?.dataValues.id,
        },
        __JWT_SECRET__,
        { expiresIn: "15min" }
      ); // Imposta la scadenza come preferisci

      // Costruisci l'URL con il token nella query string
      const confirmationUrl = `${webAppUrl}/reset-password?tempTk=${token}`;

      // Invia l'email di conferma
      await sendEmail({
        to: email,
        subject: `Reset password`,
        text: `Hai 15 minuti per cambiare la password su ${confirmationUrl}`,
      });

      res.status(StatusCode.Ok).send("Email cambio password inoltrata con successo!");
    } catch (err) {
      next(err);
    }
  }
);

export default router;
