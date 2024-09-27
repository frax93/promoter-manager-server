import { Utente } from "../db-models/user";
import { Request, Response, Router } from "express";
import jwtMiddleware from "../middleware/jwt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { sendEmail, webAppUrl } from "../utils/send-email";
import { __JWT_SECRET__ } from "../constants/environment";
import jwt from "jsonwebtoken";
import { Team } from "../db-models/team";
import { UtenteTeam } from "../db-models/user-team";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req, res) => {
  try {
    const utenti = await Utente.findAll();
    res.json(utenti);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero degli utenti");
  }
});

router.get("/abilita-2fa", async (req: Request, res: Response) => {
  const userId = req.user?.id; // Assumendo che req.user sia popolato dal middleware JWT

  try {
    const user = await Utente.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
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

    res.json({
      message: "2FA abilitata con successo",
      qrCode,
      secret: secret.base32,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Errore durante l'abilitazione della 2FA", error });
  }
});

router.get("/disabilita-2fa", async (req: Request, res: Response) => {
  const userId = req.user?.id; // Assumendo che req.user sia popolato dal middleware JWT

  try {
    const user = await Utente.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
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

    res.json({ message: "2FA disabilitata con successo" });
  } catch (error) {
    res.status(500).json({
      message: "Errore durante la disabilitazione della 2FA",
      error,
    });
  }
});

// API per recuperare un utente per ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const utente = await Utente.findByPk(id);
    if (!utente) {
      return res.status(404).send("Utente non trovato");
    }
    res.json(utente);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero dell'utente");
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { referralLink, linkAzienda, linkVideo } = req.body;

  try {
    const utente = await Utente.findByPk(id);
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    await utente.update({
      referrallink: referralLink,
      linkazienda: linkAzienda,
      linkvideo: linkVideo,
    });

    res.json(utente);
  } catch (error) {
    res.status(500).json({ message: "Errore del server", error });
  }
});

router.post("/disponibilita", async (req, res) => {
  const { emails = [] } = req.body;
  const name = req.user?.name;
  const emailUser = req.user?.email;
  const id = req.user?.id;
  try {
    const teamCliente = await UtenteTeam.findOne({
      where: { id_utente: id },
      include: [
        {
          model: Team,
          as: "team_id",
          where: {
            is_cliente: true,
          },
        },
      ],
    });

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
      const confirmationUrl = `${webAppUrl}?tempTk=${token}`;

      // Invia l'email di conferma
      await sendEmail({
        to: email,
        subject: `Disponibilità utente ${name} - ${emailUser}`,
        text: `Controlla la disponibilità su ${confirmationUrl}`,
      });
    }

    res.send("Email inoltrate con successo!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore");
  }
});

export default router;
