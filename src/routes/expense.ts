import { Spesa } from "../db-models/expense";
import { Router } from "express";
import { Utente } from "../db-models/user";
import { Evento } from "../db-models/event";
import { Tipo } from "../db-models/type";
import jwtMiddleware from "../middleware/jwt";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req, res) => {
  try {
    const spese = await Spesa.findAll({
      include: [
        {
          model: Tipo, // Il modello collegato
          as: "tipoId", // Alias che hai dato alla relazione nel modello
        },
      ],
    });
    res.json(spese);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero delle spese");
  }
});

// API per recuperare le note di un utente
router.get("/utente", async (req, res) => {
  try {
    const spese = await Spesa.findAll({
      where: { utente_id: req.user?.id },
    });
    res.json(spese);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero delle spese");
  }
});

router.post("/", async (req, res) => {
  const { descrizione, importo, eventoId, tipoId } = req.body;

  const utenteId = req.user?.id;

  try {
    // Verifica se l'utente esiste
    const utente = await Utente.findByPk(utenteId);
    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // Verifica se l'evento esiste
    const evento = await Evento.findByPk(eventoId);
    if (!evento) {
      return res.status(404).json({ message: "Evento non trovato" });
    }

    // Verifica se l'evento esiste
    const tipo = await Tipo.findByPk(tipoId);
    if (!tipo) {
      return res.status(404).json({ message: "Tipo non trovato" });
    }

    // Crea la nuova spesa associata all'utente e all'evento
    const nuovaSpesa = await Spesa.create({
      descrizione,
      importo,
      utente_id: utenteId,
      evento_id: eventoId,
      tipo_id: tipoId,
    });

    // Rispondi con la spesa creata
    res.status(201).json(nuovaSpesa);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Errore durante la creazione della spesa" });
  }
});

export default router;
