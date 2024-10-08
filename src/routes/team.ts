import { Team } from "../db-models/team";
import { NextFunction, Request, Response, Router } from "express";
import { Utente } from "../db-models/user";
import jwtMiddleware from "../middleware/jwt";
import { UtenteTeam } from "../db-models/user-team";
import { Calendario } from "../db-models/calendar";
import { DateTime } from "luxon";
import { Model } from "sequelize";
import { TeamModel } from "../models/team";
import { UserModel } from "../models/user";
import { validateRequest } from "../middleware/validate-schema";
import { createTeamSchema, deleteTeamSchema, getTeamSchema, updateTeamSchema } from "../schema/team";
import { PromoterManagerRequest, PromoterManagerRequestBody } from "../types/request";
import { CreateTeamBody, DeleteTeamParams, GetTeamParams, UpdateTeamBody, UpdateTeamParams } from "../types/team";
import { NotFoundError } from "../errors/not-found-error";
import { BadRequestError } from "../errors/bad-request-error";
import { logger } from "../utils/logger";
import { StatusCode } from "../constants/status-code";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = await Team.findAll();
    res.status(StatusCode.Ok).json(teams);
  } catch (err) {
    next(err);
  }
});

// Route per ottenere tutti i team di un utente
router.get("/utente", async (req: Request, res: Response, next: NextFunction) => {
  const idUtente = req.user?.id;

  try {
    // Trova l'utente
    const utente: Model<UserModel> | null = await Utente.findByPk(idUtente, {
      include: [
        {
          model: Team,
          as: "team", // Alias dell'associazione
          where: {
            attivo: true,
          },
          include: [
            {
              model: Utente,
              as: "utenti", // Alias dell'associazione
            },
          ],
        },
      ],
    });

    // Verifica se l'utente esiste
    if (!utente) {
      throw new NotFoundError("Utente non trovato");
    }

    // Recupera tutti i team associati all'utente
    const teams = utente.dataValues.team;

    res.status(StatusCode.Ok).json(teams);
  } catch (err) {
   next(err);
  }
});

// API per recuperare un team per ID
router.get(
  "/:id",
  validateRequest(getTeamSchema),
  async (req: PromoterManagerRequest<GetTeamParams>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const team = await Team.findByPk(id);
      if (!team) {
        throw new NotFoundError("Team non trovato");
      }
      res.status(StatusCode.Ok).json(team);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/utente",
  validateRequest(createTeamSchema),
  async (req: PromoterManagerRequestBody<CreateTeamBody>, res: Response, next: NextFunction) => {
    const { nome, descrizione, colore, utentiIds } = req.body;
    const idUtente = req.user?.id;

    try {
      const utente = await Utente.findByPk(idUtente);

      if (!utente) {
        throw new NotFoundError("Utente non trovato");
      }

      const nuovoTeam = await Team.create({ nome, descrizione, colore });

      // Associa l'utente al team
      await UtenteTeam.create({
        utente_id: idUtente,
        team_id: nuovoTeam.dataValues.id,
      });

      const utenti = await Utente.findAll({ where: { id: utentiIds } });

      if (utentiIds && utenti.length !== utentiIds.length) {
        throw new BadRequestError("Alcuni utenti non sono stati trovati");
      }

      // Aggiunge gli utenti al team
      await Promise.all(
        (utentiIds as Array<number>).map(async (id) => {
          return await UtenteTeam.create({
            utente_id: id,
            team_id: nuovoTeam.dataValues.id,
          });
        })
      );

      await Calendario.create({
        nome: `Calendario ${nome}`,
        descrizione: `Calendario principale per ${nome}`,
        team_id: nuovoTeam.dataValues.id,
      });

      res.status(StatusCode.Created).json(nuovoTeam);
    } catch (err) {
      next(err);
    }
  }
);

// Modifica del team
router.put(
  "/:id",
  validateRequest(updateTeamSchema),
  async (
    req: PromoterManagerRequest<UpdateTeamParams, UpdateTeamBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { nome, descrizione, utentiIds: userIds, colore } = req.body;

    try {
      // Trova il team per ID
      const team = await Team.findByPk(id, {
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

      // Aggiorna i dettagli del team
      await team.update({
        nome,
        descrizione,
        colore,
      });

      // Se sono stati passati userIds, aggiorna i membri del team
      if (Array.isArray(userIds)) {
        // Trova gli utenti corrispondenti agli userIds
        const utenti = await Utente.findAll({
          where: {
            id: userIds,
          },
        });

        // Elenco di ID utente
        const userIdsToAdd = utenti.map((utente) => utente.dataValues.id);

        // Trova i membri esistenti del team
        const currentMembers = team.dataValues.utenti;

        // Elenco di ID utenti attualmente nel team
        const currentUserIds = currentMembers.map(
          (member: { id: number }) => member.id
        );

        // Trova gli utenti da aggiungere e rimuovere
        const usersToAdd = userIdsToAdd.filter(
          (id) => !currentUserIds.includes(id)
        );
        const usersToRemove = currentUserIds.filter(
          (id: number) => !userIdsToAdd.includes(id)
        );

        logger.debug(userIdsToAdd + "to add");
        logger.debug(usersToRemove + "to remove");

        await Promise.all(
          (usersToAdd as Array<number>).map(async (id) => {
            return await UtenteTeam.create(
              {
                utente_id: id,
                team_id: team.dataValues.id,
              },
              { ignoreDuplicates: true }
            );
          })
        );

        if (usersToRemove.length > 0) {
          await Promise.all(
            (usersToRemove as Array<number>).map(async (id) => {
              return await UtenteTeam.destroy({
                where: {
                  utente_id: id,
                  team_id: team.dataValues.id,
                },
              });
            })
          );
        }
      }

      res.status(StatusCode.Created).json({ message: "Team aggiornato con successo" });
    } catch (error) {
      next(error);
    }
  }
);

// Nuovo endpoint per cancellazione logica
router.delete(
  "/:id",
  validateRequest(deleteTeamSchema),
  async (
    req: PromoterManagerRequest<DeleteTeamParams>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    try {
      // Trova il team per ID
      const team: Model<TeamModel> | null = await Team.findByPk(id);

      if (!team) {
        throw new NotFoundError("Team non trovato");
      }

      // Effettua la cancellazione logica impostando il flag attivo su false
      await team.update({ attivo: false, data_disattivo: DateTime.now() });

      res.status(StatusCode.Created).json({ message: "Team disattivato con successo" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
