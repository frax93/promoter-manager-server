import { Spesa } from "../db-models/expense";
import { NextFunction, Request, Response, Router } from "express";
import { Utente } from "../db-models/user";
import { Tipo } from "../db-models/type";
import jwtMiddleware from "../middleware/jwt";
import {
  createExpenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
} from "../schema/expense"; 
import { validateRequest } from "../middleware/validate-schema"; 
import { PromoterManagerRequest, PromoterManagerRequestBody } from "../types/request";
import { CreateExpenseRequestBody, DeleteExpenseRequestParams, UpdateExpenseRequestBody, UpdateExpenseRequestParams } from "../types/expense";
import { NotFoundError } from "../errors/not-found-error";
import { Model } from "sequelize";
import { UserModel } from "../models/user";
import { UnauthorizedError } from "../errors/unauthorized-error";

const router = Router();

router.use(jwtMiddleware());

// Endpoint per recuperare tutte le spese
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
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
    next(err);
  }
});

// API per recuperare le note di un utente
router.get("/utente", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spese = await Spesa.findAll({
      where: { utente_id: req.user?.id },
      include: [
        {
          model: Tipo, // Il modello collegato
          as: "tipoId", // Alias che hai dato alla relazione nel modello
        },
      ],
    });
    res.json(spese);
  } catch (err) {
    next(err);
  }
});

// POST /spesa - Crea una spesa
router.post(
  "/",
  validateRequest(createExpenseSchema),
  async (
    req: PromoterManagerRequestBody<CreateExpenseRequestBody>,
    res: Response,
    next: NextFunction,
  ) => {
    const { descrizione, importo, tipoId, guadagno_spesa, tipo_importo } =
      req.body;

    const utenteId = req.user?.id;

    try {
      // Verifica se l'utente esiste
      const utente = await Utente.findByPk(utenteId);

      if (!utente) {
        throw new NotFoundError("Utente non trovato");
      }

      if (!guadagno_spesa) {
        // Verifica se il tipo esiste
        const tipo = await Tipo.findByPk(tipoId);
        if (!tipo) {
          throw new NotFoundError("Tipo non trovato");
        }
      }

      // Crea la nuova spesa associata all'utente e all'evento
      const nuovaSpesa = await Spesa.create({
        descrizione,
        importo,
        utente_id: utenteId,
        tipo_id: tipoId,
        tipo_importo,
        guadagno_spesa,
      });

      // Rispondi con la spesa creata
      res.status(201).json(nuovaSpesa);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /spesa/:id - Aggiorna una spesa
router.put(
  "/:id",
  validateRequest(updateExpenseSchema),
  async (
    req: PromoterManagerRequest<
      UpdateExpenseRequestParams,
      UpdateExpenseRequestBody
    >,
    res: Response,
    next: NextFunction,
  ) => {
    const { id } = req.params;
    const { descrizione, importo, tipoId, tipo_importo } = req.body;

    const userId = req.user?.id;

    try {
      const spesa = await Spesa.findByPk(id);
      if (!spesa) {
        throw new NotFoundError("Spesa non trovata");
      }

      const utente: Model<UserModel> | null = await Utente.findByPk(userId);

      if (!(utente?.dataValues?.id === spesa.dataValues.utente_id)) {
        throw new UnauthorizedError("Spesa non appartenente all'utente");
      }

      const spesaUpdated = await spesa.update({
        descrizione,
        importo,
        tipo_id: tipoId,
        tipo_importo,
      });

      res.json(spesaUpdated);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /spesa/:id - Elimina una spesa
router.delete(
  "/:id",
  validateRequest(deleteExpenseSchema),
  async (
    req: PromoterManagerRequest<DeleteExpenseRequestParams>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    const userId = req.user?.id;
    
    try {
      const spesa = await Spesa.findByPk(id);

      if (!spesa) {
        throw new NotFoundError("Spesa non trovata");
      }

      const utente: Model<UserModel> | null = await Utente.findByPk(userId);

      if (!(utente?.dataValues?.id === spesa.dataValues.utente_id)) {
        throw new UnauthorizedError("Spesa non appartenente all'utente");
      }

      await spesa.destroy();
      res.json({ message: "Spesa eliminata" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
