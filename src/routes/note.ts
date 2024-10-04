import { Note } from "../db-models/note";
import { NextFunction, Request, Response, Router } from "express";
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
import { validateRequest } from "../middleware/validate-schema";
import {
  createNoteSchema,
  deleteNoteSchema,
  markCompleteNoteSchema,
  updateNoteSchema,
} from "../schema/note";
import { NotFoundError } from "../errors/not-found-error";
import { BadRequestError } from "../errors/bad-request-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UserModel } from "../models/user";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findAll({
      order: [["data_creazione", "DESC"]],
    });
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// API per recuperare le note di un utente
router.get(
  "/utente",
  async (req: Request, res: Response, next: NextFunction) => {
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
      next(err);
    }
  }
);

// Endpoint per creare una nuova nota associata a un utente
router.post(
  "/",
  validateRequest(createNoteSchema),
  async (
    req: PromoterManagerRequestBody<CreateNoteBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { contenuto, reminderDate, token, priorita } = req.body;
    const idUtente = req.user?.id;

    try {
      // Verifica se l'utente esiste
      const utente = await Utente.findByPk(idUtente);

      if (!utente) {
        throw new NotFoundError("Utente non trovato");
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
      next(err);
    }
  }
);

router.patch(
  "/:id/marca-completata",
  validateRequest(markCompleteNoteSchema),
  async (
    req: PromoterManagerRequest<UpdateNoteParams, UpdateNoteBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { completed } = req.body;

    const userId = req.user?.id;

    try {
      if (typeof completed !== "boolean") {
        throw new BadRequestError(
          "Il campo completed deve essere un booleano."
        );
      }

      const note = await Note.findByPk(id);

      if (!note) {
        throw new NotFoundError("Nota non trovata.");
      }

      const utente: Model<UserModel> | null = await Utente.findByPk(userId);

      if (!(utente?.dataValues?.id === note.dataValues.utente_id)) {
        throw new UnauthorizedError("Nota non appartenente all'utente");
      }

      const responseNote = await note.update({
        completed,
      });

      const response = {
        ...responseNote,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /note/:id - Aggiorna una nota
router.put(
  "/:id",
  validateRequest(updateNoteSchema),
  async (
    req: PromoterManagerRequest<UpdateNoteParams, UpdateNoteBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { contenuto, reminderDate, priorita } = req.body;

    const userId = req.user?.id;

    try {
      let note: Model<NoteModel> | null = await Note.findByPk(id);

      if (!note) {
        throw new NotFoundError("Nota non trovata");
      }

      const utente: Model<UserModel> | null = await Utente.findByPk(userId);

      if (!(utente?.dataValues?.id === note.dataValues.utente_id)) {
        throw new UnauthorizedError("Nota non appartenente all'utente");
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
      next(error);
    }
  }
);

// DELETE /note/:id - Elimina una nota
router.delete(
  "/:id",
  validateRequest(deleteNoteSchema),
  async (
    req: PromoterManagerRequest<DeleteNoteParams>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    const userId = req.user?.id;

    try {
      const note: Model<NoteModel> | null = await Note.findByPk(id);
      if (!note) {
        throw new NotFoundError("Nota non trovata");
      }

      const utente: Model<UserModel> | null = await Utente.findByPk(userId);

      if (!(utente?.dataValues?.id === note.dataValues.utente_id)) {
        throw new UnauthorizedError("Nota non appartenente all'utente");
      }

      await note.destroy();
      res.status(200).json({ message: "Nota eliminata" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
