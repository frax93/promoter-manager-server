import { Spesa } from "../db-models/expense";
import { Request, Response, Router } from "express";
import { Utente } from "../db-models/user";
import { Tipo } from "../db-models/type";
import jwtMiddleware from "../middleware/jwt";
import {
  createExpenseSchema,
  updateExpenseSchema,
  deleteExpenseSchema,
} from "../schema/expense"; 
import { validateRequest } from "../utils/validate-schema"; 
import { PromoterManagerRequest, PromoterManagerRequestBody } from "../types/request";
import { CreateExpenseRequestBody, DeleteExpenseRequestParams, UpdateExpenseRequestBody, UpdateExpenseRequestParams } from "../types/expense";

const router = Router();

router.use(jwtMiddleware());

// Endpoint per recuperare tutte le spese
router.get("/", async (req: Request, res: Response) => {
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
router.get("/utente", async (req: Request, res: Response) => {
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
    console.error(err);
    res.status(500).send("Errore nel recupero delle spese");
  }
});

// POST /spesa - Crea una spesa
router.post(
  "/",
  validateRequest(createExpenseSchema),
  async (
    req: PromoterManagerRequestBody<CreateExpenseRequestBody>,
    res: Response
  ) => {
    const { descrizione, importo, tipoId, guadagno_spesa, tipo_importo } =
      req.body;

    const utenteId = req.user?.id;

    try {
      // Verifica se l'utente esiste
      const utente = await Utente.findByPk(utenteId);
      if (!utente) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      if (!guadagno_spesa) {
        // Verifica se il tipo esiste
        const tipo = await Tipo.findByPk(tipoId);
        if (!tipo) {
          return res.status(404).json({ message: "Tipo non trovato" });
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
      console.error(err);
      res
        .status(500)
        .json({ message: "Errore durante la creazione della spesa" });
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
    res: Response
  ) => {
    const { id } = req.params;
    const { descrizione, importo, tipoId, tipo_importo } = req.body;

    try {
      const spesa = await Spesa.findByPk(id);
      if (!spesa) {
        return res.status(404).json({ message: "Spesa non trovata" });
      }

      const spesaUpdated = await spesa.update({
        descrizione,
        importo,
        tipo_id: tipoId,
        tipo_importo,
      });
      res.json(spesaUpdated);
    } catch (error) {
      res.status(500).json({ message: "Errore del server", error });
    }
  }
);

// DELETE /spesa/:id - Elimina una spesa
router.delete(
  "/:id",
  validateRequest(deleteExpenseSchema),
  async (
    req: PromoterManagerRequest<DeleteExpenseRequestParams>,
    res: Response
  ) => {
    const { id } = req.params;

    try {
      const spesa = await Spesa.findByPk(id);
      if (!spesa) {
        return res.status(404).json({ message: "Spesa non trovata" });
      }

      await spesa.destroy();
      res.json({ message: "Spesa eliminata" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Errore del server" });
    }
  }
);

export default router;
