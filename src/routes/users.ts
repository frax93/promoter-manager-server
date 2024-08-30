import { Utente } from "../db-models/user";
import { Router } from "express";
import jwtMiddleware from "../middleware/jwt";

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

export default router;
