import { Router, Response, Request } from "express";
import { Calendario } from "../db-models/calendar";
import { Evento } from "../db-models/event";
import { validateRequest } from "../utils/validate-schema";
import { getEventsByCalendarIdSchema } from "../schema/calendar";  // Importa il tipo e lo schema
import jwtMiddleware from "../middleware/jwt";
import { PromoterManagerRequest } from "../types/request";
import { GetEventsByCalendarIdRequestParams } from "../types/calendar";
import { CalendarModel } from "../models/calendar";
import { Model } from "sequelize";

const router = Router();

// Applicazione del middleware JWT
router.use(jwtMiddleware());

// API per recuperare tutti i calendari
router.get("/", async (req: Request, res: Response) => {
  try {
    const calendari = await Calendario.findAll();
    res.json(calendari);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero dei calendari");
  }
});

// API per recuperare gli eventi associati a un calendario
router.get(
  "/:id/eventi",
  validateRequest(getEventsByCalendarIdSchema), // Middleware di validazione applicato
  async (
    req: PromoterManagerRequest<GetEventsByCalendarIdRequestParams>,
    res: Response
  ) => {
    // Tipo specifico per la richiesta
    const { id } = req.params;
    try {
      const calendario: Model<CalendarModel> | null = await Calendario.findByPk(
        id,
        {
          include: { model: Evento, as: "eventi" },
        }
      );
      if (!calendario) {
        return res.status(404).send("Nessun evento trovato per il calendario");
      }
      res.json(calendario);
    } catch (err) {
      console.error(err);
      res.status(500).send("Errore nel recupero degli eventi");
    }
  }
);

export default router;
