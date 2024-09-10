import { Note } from "../db-models/note";
import { Request, Response, Router } from "express";
import { Utente } from "../db-models/user";
import jwtMiddleware from "../middleware/jwt";
import { Model } from "sequelize";

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

router.patch('/:id/marca-completata', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Il campo completed deve essere un booleano.' });
  }

  try {
    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({ error: 'Nota non trovata.' });
    }

    note.dataValues.completed = completed;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Errore nel marcare la nota come completata:', error);
    res.status(500).json({ error: 'Errore del server.' });
  }
});

export default router;
