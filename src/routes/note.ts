import { Note } from "../db-models/note";
import { Router } from "express";
import { Utente } from "../db-models/user";
import jwtMiddleware from "../middleware/jwt";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req, res) => {
  try {
    const note = await Note.findAll();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero delle note");
  }
});

// API per recuperare le note di un utente
router.get("/utente", async (req, res) => {
  const idUtente = req.user?.id;
  try {
    const note = await Note.findAll({
      where: { utente_id: idUtente },
    });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero delle note");
  }
});

// Endpoint per creare una nuova nota associata a un utente
router.post("/", async (req, res) => {
  const { contenuto } = req.body;
  const idUtente = req.user?.id;

  try {
    // Verifica se l'utente esiste
    const utente = await Utente.findByPk(idUtente);
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // Crea la nuova nota associata all'utente
    const nuovaNota = await Note.create({
      contenuto,
      utente_id: idUtente,
    });

    // Rispondi con la nota creata
    res.status(201).json(nuovaNota);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante la creazione della nota" });
  }
});

export default router;
