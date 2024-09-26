import { Utente } from "../db-models/user";
import { Request, Response, Router } from "express";
import jwtMiddleware from "../middleware/jwt";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { sendEmail } from "../utils/send-email";

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

router.get(
  "/abilita-2fa",
  async (req: Request, res: Response) => {
    const userId = req.user?.id; // Assumendo che req.user sia popolato dal middleware JWT

    try {
      const user = await Utente.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Genera un nuovo segreto per la 2FA
      const secret = speakeasy.generateSecret({ length: 20 });

      await Utente.update({
        two_factor_secret: secret.base32,
        two_factor_enabled: true,
      }, {
        where: { id: userId }
      });

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
  }
);

router.get(
  "/disabilita-2fa",
  async (req: Request, res: Response) => {
    const userId = req.user?.id; // Assumendo che req.user sia popolato dal middleware JWT

    try {
      const user = await Utente.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      await Utente.update({
        two_factor_secret: null,
        two_factor_enabled: false,
      }, {
        where: { id: userId }
      });

      res.json({ message: "2FA disabilitata con successo" });
    } catch (error) {
      res.status(500).json({
        message: "Errore durante la disabilitazione della 2FA",
        error,
      });
    }
  }
);

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

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { referralLink, linkAzienda, linkVideo } = req.body;

  try {
    const utente = await Utente.findByPk(id);
    if (!utente) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    await utente.update({
      referrallink: referralLink,
      linkazienda: linkAzienda,
      linkvideo: linkVideo,
    });

    res.json(utente);
  } catch (error) {
    res.status(500).json({ message: 'Errore del server', error });
  }
});


router.post("/disponibilita", async (req, res) => {
  const { emails = [] } = req.body;
  const name = req.user?.name; 
  const email = req.user?.email;
  try {
    for (const email of emails) {
      // Invia l'email di conferma
      await sendEmail({
        to: email,
        subject: `Disponibilità utente ${name} - ${email}`,
        html: `<html><body><p>testo email</p></body></html>`,
      });
    }

    res.send("Email inoltrate con successo!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore");
  }
});

export default router;
