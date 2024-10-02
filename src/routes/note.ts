import { Note } from "../db-models/note";
import { Request, Response, Router } from "express";
import { Utente } from "../db-models/user";
import jwtMiddleware from "../middleware/jwt";
import { Priority } from "../db-models/priority";
import { NoteModel } from "../models/note";
import { Model } from "sequelize";
import {
  PromoterManagerRequest,
  PromoterManagerRequestBody,
} from "../types/request";
import {
  CreateNoteBody,
  DeleteNoteParams,
  UpdateNoteBody,
  UpdateNoteParams,
} from "../types/note";
import { validateRequest } from "../utils/validate-schema";
import {
  createNoteSchema,
  deleteNoteSchema,
  markCompleteNoteSchema,
  updateNoteSchema,
} from "../schema/note";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req: Request, res: Response) => {
  try {
    const note = await Note.findAll({
      order: [["data_creazione", "DESC"]],
    });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero delle note");
  }
});

// API per recuperare le note di un utente
router.get("/utente", async (req: Request, res: Response) => {
  const idUtente = req.user?.id;
  try {
    const note = await Note.findAll({
      where: { utente_id: idUtente },
      include: [
        {
          model: Priority,
          as: "priority",
        },
      ],
    });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero delle note");
  }
});

// Endpoint per creare una nuova nota associata a un utente
router.post(
  "/",
  validateRequest(createNoteSchema),
  async (req: PromoterManagerRequestBody<CreateNoteBody>, res: Response) => {
    const { contenuto, reminderDate, token, priorita } = req.body;
    const idUtente = req.user?.id;

    try {
      // Verifica se l'utente esiste
      const utente = await Utente.findByPk(idUtente);
      if (!utente) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Crea la nuova nota associata all'utente
      const nuovaNota = await Note.create({
        priority_id: priorita,
        contenuto,
        utente_id: idUtente,
        reminder_date: reminderDate ? new Date(reminderDate) : null,
        token,
      });

      // Rispondi con la nota creata
      res.status(201).json(nuovaNota);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Errore durante la creazione della nota" });
    }
  }
);

router.patch(
  "/:id/marca-completata",
  validateRequest(markCompleteNoteSchema),
  async (
    req: PromoterManagerRequest<UpdateNoteParams, UpdateNoteBody>,
    res: Response
  ) => {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res
        .status(400)
        .json({ error: "Il campo completed deve essere un booleano." });
    }

    try {
      const note = await Note.findByPk(id);

      if (!note) {
        return res.status(404).json({ error: "Nota non trovata." });
      }

      const responseNote = await note.update({
        completed,
      });

      const response = {
        ...responseNote,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Errore nel marcare la nota come completata:", error);
      res.status(500).json({ error: "Errore del server." });
    }
  }
);

// PUT /note/:id - Aggiorna una nota
router.put(
  "/:id",
  validateRequest(updateNoteSchema),
  async (
    req: PromoterManagerRequest<UpdateNoteParams, UpdateNoteBody>,
    res: Response
  ) => {
    const { id } = req.params;
    const { contenuto, reminderDate, priorita } = req.body;

    try {
      let note: Model<NoteModel> | null = await Note.findByPk(id);
      if (!note) {
        return res.status(404).json({ message: "Nota non trovata" });
      }

      const responseNote = await note.update({
        priority_id: priorita,
        contenuto,
        reminder_date: reminderDate ? new Date(reminderDate) : null,
      });

      const response = {
        ...responseNote,
        contenuto,
        reminder_date: reminderDate,
        priorita,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Errore del server", error });
    }
  }
);

// DELETE /note/:id - Elimina una nota
router.delete(
  "/:id",
  validateRequest(deleteNoteSchema),
  async (req: PromoterManagerRequest<DeleteNoteParams>, res: Response) => {
    const { id } = req.params;

    try {
      const note = await Note.findByPk(id);
      if (!note) {
        return res.status(404).json({ message: "Nota non trovata" });
      }

      await note.destroy();
      res.status(200).json({ message: "Nota eliminata" });
    } catch (error) {
      res.status(500).json({ message: "Errore del server", error });
    }
  }
);

export default router;
