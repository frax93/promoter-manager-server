import { Router, Response, Request, NextFunction } from "express";
import { Calendario } from "../db-models/calendar";
import { Evento } from "../db-models/event";
import { validateRequest } from "../middleware/validate-schema";
import { getEventsByCalendarIdSchema } from "../schema/calendar";  // Importa il tipo e lo schema
import jwtMiddleware from "../middleware/jwt";
import { PromoterManagerRequest } from "../types/request";
import { GetEventsByCalendarIdRequestParams } from "../types/calendar";
import { CalendarModel } from "../models/calendar";
import { Model } from "sequelize";
import { NotFoundError } from "../errors/not-found-error";
import { StatusCode } from "../constants/status-code";

const router = Router();

// Applicazione del middleware JWT
router.use(jwtMiddleware());

// API per recuperare tutti i calendari
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const calendari = await Calendario.findAll();
    res.status(StatusCode.Ok).json(calendari);
  } catch (err) {
    next(err);
  }
});

// API per recuperare gli eventi associati a un calendario
router.get(
  "/:id/eventi",
  validateRequest(getEventsByCalendarIdSchema), // Middleware di validazione applicato
  async (
    req: PromoterManagerRequest<GetEventsByCalendarIdRequestParams>,
    res: Response,
    next: NextFunction
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
        throw new NotFoundError("Nessun evento trovato per il calendario");
      }

      res.status(StatusCode.Ok).json(calendario);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
