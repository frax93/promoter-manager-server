import { Utente } from "../db-models/user";
import { NextFunction, Request, Response, Router } from "express";
import jwtMiddleware from "../middleware/jwt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { sendEmail, webAppUrl } from "../utils/send-email";
import { __JWT_SECRET__ } from "../constants/environment";
import jwt from "jsonwebtoken";
import { Team } from "../db-models/team";
import bcrypt from 'bcryptjs';
import { UserModel } from "../models/user";
import { Model } from "sequelize";
import { validateRequest } from "../middleware/validate-schema";
import { availabilitySchema, changePasswordSchema, getUserSchema, updateUserSchema } from "../schema/users";
import { PromoterManagerRequest, PromoterManagerRequestBody } from "../types/request";
import { AvailabilityBody, ChangePasswordBody, GetUserParams, UpdateUserBody, UpdateUserParams } from "../types/users";
import { NotFoundError } from "../errors/not-found-error";
import { UnauthanteticatedError } from "../errors/unauthenticated-error";
import { StatusCode } from "../constants/status-code";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const utenti = await Utente.findAll();
    res.status(StatusCode.Ok).json(utenti);
  } catch (err) {
    next(err);
  }
});

router.get("/abilita-2fa", async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id; // Assumendo che req.user sia popolato dal middleware JWT

  try {
    const user = await Utente.findByPk(userId);
    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    // Genera un nuovo segreto per la 2FA
    const secret = speakeasy.generateSecret({ length: 20 });

    await Utente.update(
      {
        two_factor_secret: secret.base32,
        two_factor_enabled: true,
      },
      {
        where: { id: userId },
      }
    );

    // Genera l'URL per l'app di autenticazione
    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `AppName (${user.dataValues.email})`,
      encoding: "base32",
    });

    // Genera il QR code per l'app di autenticazione
    const qrCode = await qrcode.toDataURL(otpAuthUrl);

    res.status(StatusCode.Created).json({
      message: "2FA abilitata con successo",
      qrCode,
      secret: secret.base32,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/disabilita-2fa", async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id; // Assumendo che req.user sia popolato dal middleware JWT

  try {
    const user = await Utente.findByPk(userId);
    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    await Utente.update(
      {
        two_factor_secret: null,
        two_factor_enabled: false,
      },
      {
        where: { id: userId },
      }
    );

    res.status(StatusCode.Created).json({ message: "2FA disabilitata con successo" });
  } catch (error) {
    next(error);
  }
});

// API per recuperare un utente per ID
router.get(
  "/:id",
  validateRequest(getUserSchema),
  async (req: PromoterManagerRequest<GetUserParams>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const utente = await Utente.findByPk(id);
      if (!utente) {
        throw new NotFoundError("Utente non trovato");
      }
      res.status(StatusCode.Ok).json(utente);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  validateRequest(updateUserSchema),
  async (
    req: PromoterManagerRequest<UpdateUserParams, UpdateUserBody>,
    res: Response, next: NextFunction
  ) => {
    const { id } = req.params;
    const { referralLink, linkAzienda, linkVideo } = req.body;

    try {
      const utente = await Utente.findByPk(id);
      if (!utente) {
        throw new NotFoundError("Utente non trovato");
      }

      await utente.update({
        referrallink: referralLink,
        linkazienda: linkAzienda,
        linkvideo: linkVideo,
      });

      res.status(StatusCode.Created).json(utente);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/disponibilita",
  validateRequest(availabilitySchema),
  async (req: PromoterManagerRequestBody<AvailabilityBody>, res: Response, next: NextFunction) => {
    const { emails = [], token } = req.body;
    const name = req.user?.name;
    const emailUser = req.user?.email;
    const id = req.user?.id;
    try {
      const teamCliente = await Team.findOne({
        where: {
          attivo: true,
          is_cliente: true,
        },
        include: [
          {
            model: Utente,
            as: "utenti", // Alias dell'associazione
            where: {
              id,
            },
          },
        ],
      });

      await Utente.update(
        { push_token: token }, // Dati che vuoi aggiornare
        {
          where: {
            id: id, // Condizione where
          },
        }
      );

      for (const email of emails) {
        // Genera il JWT
        const token = jwt.sign(
          {
            id: id,
            team: teamCliente?.dataValues?.id,
          },
          __JWT_SECRET__,
          { expiresIn: "1h" }
        ); // Imposta la scadenza come preferisci

        // Costruisci l'URL con il token nella query string
        const confirmationUrl = `${webAppUrl}/disponibilità?tempTk=${token}`;

        // Invia l'email di conferma
        await sendEmail({
          to: email,
          subject: `Disponibilità utente ${name} - ${emailUser}`,
          text: `Controlla la disponibilità su ${confirmationUrl}`,
        });
      }

      res.status(StatusCode.Created).send("Email inoltrate con successo!");
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/cambia-password",
  validateRequest(changePasswordSchema),
  async (
    req: PromoterManagerRequestBody<ChangePasswordBody>,
    res: Response, next: NextFunction
  ) => {
    const { password } = req.body;
    const id = req.user?.id;
    try {
      const salt = await bcrypt.genSalt(10);

      const passwordCrypted = await bcrypt.hash(password, salt);

      const utente: Model<UserModel> | null = await Utente.findByPk(id);
      if (!utente) {
        throw new NotFoundError("Utente non trovato");
      }

      const passwordIsValid = await bcrypt.compare(
        password,
        utente.dataValues.password
      );

      if (passwordIsValid) {
       throw new UnauthanteticatedError("Password uguale alla precedente, scegline un'altra");
      }

      await utente.update(
        { password: passwordCrypted }, // Dati che vuoi aggiornare
        {
          where: {
            id: id, // Condizione where
          },
        }
      );

      res.status(StatusCode.Created).send("Cambio password effettuato con successo!");
    } catch (err) {
      next(err);
    }
  }
);

export default router;
