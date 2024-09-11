import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Utente } from "../db-models/user";
import { __JWT_SECRET__ } from "../constants/environment";
import speakeasy from "speakeasy";
import { UserModel } from "../models/user";
import { Model } from "sequelize";
import { generateConfirmationToken } from "../utils/generate-confirmation-token";
import { sendConfirmationEmail } from "../utils/send-email";
import { DateTime } from 'luxon';

const router = express.Router();
router.post("/verifica-utenza", async (req, res) => {
  const { email, password } = req.body;

  try {
    const utente: Model<UserModel> | null = await Utente.findOne({
      where: { email },
    });
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      utente.dataValues.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Password errata" });
    }

    res.status(200).json({
      ...utente.dataValues,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Errore in verifica utente" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, token2FA } = req.body;

  try {
    const utente: Model<UserModel> | null = await Utente.findOne({
      where: { email },
    });
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      utente.dataValues.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Password errata" });
    }

    if (utente.dataValues.two_factor_enabled) {
      // Verifica il codice 2FA
      const verified = speakeasy.totp.verify({
        secret: utente.dataValues.two_factor_secret,
        encoding: "base32",
        token: token2FA,
      });

      if (!verified) {
        return res.status(400).json({ message: "Codice 2FA non valido" });
      }
    }

    const token = jwt.sign(
      { id: utente.dataValues.id, email: utente.dataValues.email },
      __JWT_SECRET__,
      {
        expiresIn: 86400, // 24 ore
      }
    );

    res.status(200).json({
      id: utente.dataValues.id,
      email: utente.dataValues.email,
      accessToken: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nel login" });
  }
});

// API per creare un nuovo utente
router.post("/registrazione", async (req, res) => {
  const { nome, email, password } = req.body;
  try {
    // Verifica se l'email esiste già
    const existingUser = await Utente.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send("L'email è già in uso.");
    }
    // Genera il codice di conferma
    const confirmationToken = generateConfirmationToken();

    const confirmationTokenExpires = DateTime.now().plus({ minutes: 15 }).toISO();

    const utente = await Utente.create({
      nome,
      email,
      password,
      token_verifica: confirmationToken,
      email_confermata: false,
      scadenza_token: confirmationTokenExpires,
    });
    // Invia l'email di conferma
    await sendConfirmationEmail(email, confirmationToken);
    
    res.status(201).json(utente);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nella creazione dell'utente");
  }
});

router.get('/conferma-email/:token', async (req, res) => {
  const { token } = req.params;

  // Trova l'utente con il token di conferma
  const user = await Utente.findOne({ where: { token_verifica: token } });

  if (!user) {
    return res.status(400).send('Token non valido o già utilizzato.');
  }

  // Controlla se il token è scaduto con Luxon
  const now = DateTime.now();
  const tokenExpires = DateTime.fromISO(user.dataValues.scadenza_token);

  if (now > tokenExpires) {
    return res.status(400).send('Il token di conferma è scaduto.');
  }

  // Aggiorna lo stato dell'utente e rimuovi il token di conferma

  await user.update({
    token_verifica: null,
    email_confermata: true,
    scadenza_token: null,
  });

  res.send('Email confermata con successo! Ora puoi effettuare il login.');
});

router.post('/reinvia-conferma', async (req, res) => {
  const { email } = req.body;

  // Trova l'utente in base all'email
  const user: Model<UserModel> | null = await Utente.findOne({ where: { email } });

  if (!user) {
    return res.status(404).send('Utente non trovato.');
  }

  if (user.dataValues?.email_confermata) {
    return res.status(400).send('L\'utente ha già confermato l\'email.');
  }

  // Genera un nuovo token e una nuova data di scadenza usando Luxon
  const newConfirmationToken = generateConfirmationToken();
  const newConfirmationTokenExpires = DateTime.now().plus({ minutes: 15 }).toISO();

  // Aggiorna lo stato dell'utente e mette il token di verifica
  await user.update({
    token_verifica: newConfirmationToken,
    email_confermata: false,
    scadenza_token: newConfirmationTokenExpires,
  });

  // Invia una nuova email di conferma
  await sendConfirmationEmail(email, newConfirmationToken);

  res.status(200).send('Nuova email di conferma inviata. Controlla la tua casella di posta.');
});

export default router;
