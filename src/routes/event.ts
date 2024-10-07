import { Router, Response, NextFunction } from "express";
import { Calendario } from "../db-models/calendar";
import { Evento } from "../db-models/event";
import { Spesa } from "../db-models/expense";
import { Request } from "express";
import { Team } from "../db-models/team";
import jwtMiddleware from "../middleware/jwt";
import { Utente } from "../db-models/user";
import { Model } from "sequelize";
import { EventoModel } from "../models/event";
import { TeamModel } from "../models/team";
import { Note } from "../db-models/note";
import { NoteModel } from "../models/note";
import { sendPushNotification } from "../utils/send-push";
import { validateRequest } from "../middleware/validate-schema"; // Importa la validazione
import {
  createEventSchema,
  updateEventSchema,
  deleteEventSchema,
  getEventExpensesSchema,
} from "../schema/event"; // Schemi
import {
  CreateEventRequestBody,
  UpdateEventRequestParams,
  UpdateEventRequestBody,
  DeleteEventRequestParams,
  GetEventExpensesRequestParams,
} from "../types/event"; // Tipi delle richieste
import { PromoterManagerRequest, PromoterManagerRequestBody } from "../types/request";
import { NotFoundError } from "../errors/not-found-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UserModel } from "../models/user";
import { ExpenseModel } from "../models/expense";
import { StatusCode } from "../constants/status-code";

const router = Router();

router.use(jwtMiddleware());

// Route per ottenere tutti gli eventi
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventi = await Evento.findAll();
    res.status(StatusCode.Ok).json(eventi);
  } catch (err) {
    next(err);
  }
});

// Route per ottenere le spese di un evento
router.get(
  "/:id/spese",
  validateRequest<GetEventExpensesRequestParams>(getEventExpensesSchema), // Validazione schema
  async (
    req: PromoterManagerRequest<GetEventExpensesRequestParams>,
    res: Response,
    next: NextFunction,
  ) => {
    const { id } = req.params;

    const userId = req.user?.id;

    try {
      const evento: Model<EventoModel> | null = await Evento.findByPk(id);

      if (!evento) {
        throw new NotFoundError('Evento non trovato');
      }

      const spese: Array<Model<ExpenseModel>> = await Spesa.findAll({
        where: { evento_id: id },
      });

      const utente: Model<UserModel> | null = await Utente.findByPk(userId);

      if (
        !(
          spese.some((el) => el.dataValues.utente_id === utente?.dataValues.id)
        )
      ) {
        throw new UnauthorizedError("Spese non appartenenti all'utente");
      }

      res.status(StatusCode.Ok).json(spese);
    } catch (err) {
      next(err);
    }
  }
);

// Route per ottenere tutti gli eventi di un utente
router.get(
  "/utente",
  async (req: Request, res: Response, next: NextFunction) => {
    const idUtente = req.user?.id;

    try {
      // Trova l'utente con i team associati e i calendari e gli eventi
      const utente = await Utente.findByPk(idUtente, {
        include: [
          {
            model: Team,
            as: "team",
            where: {
              attivo: true,
            },
            include: [
              {
                model: Calendario,
                as: "calendario",
                include: [
                  {
                    model: Evento,
                    as: "eventi",
                    include: [
                      {
                        model: Note,
                        as: "nota",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Verifica se l'utente esiste
      if (!utente) {
        throw new NotFoundError("Utente non trovato");
      }

      // Recupera tutti gli eventi associati all'utente
      const eventi = (
        utente.dataValues.team as Array<{
          calendario: { dataValues: { eventi: Array<never> } };
        }>
      ).flatMap((team) =>
        team.calendario
          ? team.calendario.dataValues.eventi.map(
              (evento: { dataValues: {} }) => ({
                ...(evento.dataValues || {}),
                team,
              })
            )
          : []
      );

      res.status(StatusCode.Ok).json(eventi);
    } catch (err) {
      next(err);
    }
  }
);

// Endpoint per creare un nuovo evento associato a un calendario (e quindi a un team)
router.post(
  "/",
  validateRequest(createEventSchema), // Validazione schema
  async (
    req: PromoterManagerRequestBody<CreateEventRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { titolo, descrizione, data_inizio, data_fine, teamId } = req.body;

    const idUtente = req.user?.id;

    const idTeam = req.user?.team || teamId;

    try {
      // Verifica se il team esiste
      const team = await Team.findByPk(idTeam, {
        include: [
          {
            model: Utente,
            as: "utenti", // Alias dell'associazione
          },
        ],
      });

      if (!team) {
        throw new NotFoundError("Team non trovato");
      }

      // Verifica se il team esiste
      const utente = await Utente.findByPk(idUtente, {
        include: [
          {
            model: Team,
            as: "team",
          },
        ],
      });

      if (
        !utente?.dataValues.team.find(
          (el: { id: number }) => el.id === team.dataValues.id
        )
      ) {
        throw new UnauthorizedError("Utente non appartiene al team");
      }

      // Trova il calendario associato al team
      const calendario = await Calendario.findOne({
        where: { team_id: idTeam },
      });

      if (!calendario) {
        throw new NotFoundError("Calendario non trovato");
      }

      // Crea il nuovo evento associato al calendario
      const nuovoEvento = await Evento.create({
        titolo,
        descrizione,
        data_inizio,
        data_fine,
        calendario_id: calendario.dataValues.id,
        team_id: idTeam,
        utente_id: idUtente,
      });

      if (team.dataValues.utenti?.length > 1) {
        const usersTeam = team.dataValues.utenti || [];
        for (const utenteTeam of usersTeam) {
          if (
            utenteTeam.dataValues.push_token &&
            utenteTeam.dataValues.id !== idUtente
          ) {
            await sendPushNotification(
              utenteTeam.dataValues.push_token,
              `è stato aggiunto un nuovo evento al calendario ${utente.dataValues.nome}`
            );
          }
        }
      }

      if (utente.dataValues.push_token && req.user?.team) {
        await sendPushNotification(
          utente.dataValues.push_token,
          "è stato aggiunto un nuovo evento al calendario"
        );
      }

      // Rispondi con l'evento creato
      res.status(StatusCode.Created).json(nuovoEvento);
    } catch (err) {
      next(err);
    }
  }
);

// Route per aggiornare un evento esistente
router.put(
  "/:id",
  validateRequest(updateEventSchema), // Validazione schema
  async (
    req: PromoterManagerRequest<
      UpdateEventRequestParams,
      UpdateEventRequestBody
    >,
    res: Response,
    next: NextFunction,
  ) => {
    const { id } = req.params;
    const { titolo, descrizione, data_inizio, data_fine, nota } = req.body;
  
    const idLoggedUser = req.user?.id;
  
    try {
      // Trova l'evento esistente
      const evento: Model<EventoModel> | null = await Evento.findByPk(id);
  
      if (!evento) {
        throw new NotFoundError("Evento non trovato");
      }
  
      // Trova il team associato all'evento
      const team: Model<TeamModel> | null = await Team.findByPk(
        evento.dataValues.team_id,
        {
          include: [{ model: Utente, as: "utenti", through: { attributes: [] } }],
        }
      );
  
      if (!team) {
        throw new NotFoundError("Team non trovato");
      }
  
      // Verifica se l'utente autenticato è un membro del team
      const isUserInTeam = team.dataValues.utenti?.some(
        (utente) => utente.dataValues.id === idLoggedUser
      );
  
      if (!isUserInTeam) {
        throw new UnauthorizedError("Non sei autorizzato a modificare questo evento");
      }
  
       // Crea la nuova nota associata all'utente
       const nuovaNota: Model<NoteModel> = await Note.create({
        contenuto: nota,
        utente_id: idLoggedUser,
      });
  
  
      // Aggiorna l'evento con i nuovi dati
      const eventoUpdated = await evento.update({
        titolo: titolo || evento.dataValues?.titolo,
        descrizione: descrizione || evento.dataValues?.descrizione,
        data_inizio: data_inizio || evento.dataValues?.data_inizio,
        data_fine: data_fine || evento.dataValues?.data_fine,
        calendario_id: evento.dataValues?.calendario_id,
        note_id: nuovaNota.dataValues?.id,
      });
  
      if (team?.dataValues?.utenti && team?.dataValues?.utenti?.length > 1) {
        const usersTeam = team.dataValues.utenti || [];
        for (const utenteTeam of usersTeam) {
          if (
            utenteTeam.dataValues.push_token &&
            utenteTeam.dataValues.id !== idLoggedUser
          ) {
            await sendPushNotification(
              utenteTeam.dataValues.push_token,
              `è stato modificato un evento nel calendario da ${req.user?.name}`
            );
          }
        }
      }
  
      return res.status(StatusCode.Created).json(eventoUpdated);
    } catch (error) {
      next(error);
    }
  }
);

// Route per eliminare un evento esistente
router.delete(
  "/:id",
  validateRequest(deleteEventSchema), // Validazione schema
  async (
    req: PromoterManagerRequest<DeleteEventRequestParams>,
    res: Response,
    next: NextFunction,
  ) => {
    const { id } = req.params;

    const idLoggedUser = req.user?.id;

    try {
      // Trova l'evento esistente
      const evento: Model<EventoModel> | null = await Evento.findByPk(id);

      if (!evento) {
        throw new NotFoundError("Evento non trovato");
      }

      // Trova il team associato all'evento
      const team: Model<TeamModel> | null = await Team.findByPk(
        evento.dataValues.team_id,
        {
          include: [
            { model: Utente, as: "utenti", through: { attributes: [] } },
          ],
        }
      );

      if (!team) {
        throw new NotFoundError("Team non trovato");
      }

      // Verifica se l'utente autenticato è un membro del team
      const isUserInTeam = team.dataValues.utenti?.some(
        (utente) => utente.dataValues.id === idLoggedUser
      );

      if (!isUserInTeam) {
        throw new UnauthorizedError("Non sei autorizzato a eliminare questo evento");
      }

      // Elimina l'evento
      await evento.destroy();

      if (team?.dataValues?.utenti && team?.dataValues?.utenti?.length > 1) {
        const usersTeam = team.dataValues.utenti || [];
        for (const utenteTeam of usersTeam) {
          if (
            utenteTeam.dataValues.push_token &&
            utenteTeam.dataValues.id !== idLoggedUser
          ) {
            await sendPushNotification(
              utenteTeam.dataValues.push_token,
              `è stato eliminato un evento nel calendario da ${req.user?.name}`
            );
          }
        }
      }

      return res.status(StatusCode.Created).json({ message: "Evento eliminato con successo" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
