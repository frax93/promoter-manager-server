import { Calendario } from "../db-models/calendar";
import { Evento } from "../db-models/event";
import { Spesa } from "../db-models/expense";
import { Request, Response, Router } from "express";
import { Team } from "../db-models/team";
import jwtMiddleware from "../middleware/jwt";
import { Utente } from "../db-models/user";
import { Model } from "sequelize";
import { EventoModel } from "../models/event";
import { TeamModel } from "../models/team";
import { Note } from "../db-models/note";
import { NoteModel } from "../models/note";
import { sendPushNotification } from "../utils/send-push";
import { UserModel } from "../models/user";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req: Request, res: Response) => {
  try {
    const eventi = await Evento.findAll();
    res.json(eventi);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero degli eventi");
  }
});

router.get("/:id/spese", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const spese = await Spesa.findAll({
      where: { evento_id: id },
    });
    res.json(spese);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero delle spese");
  }
});

// Route per ottenere tutti gli eventi di un utente
router.get("/utente", async (req: Request, res: Response) => {
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
      return res.status(404).json({ message: "Utente non trovato" });
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
    
    res.status(200).json(eventi);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Errore nel recupero degli eventi",
    });
  }
});

// Endpoint per creare un nuovo evento associato a un calendario (e quindi a un team)
router.post("/", async (req: Request, res: Response) => {
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
      return res.status(404).json({ message: "Team non trovato" });
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
      return res.status(403).json({ message: "Utente non appartiene al team" });
    }

    // Trova il calendario associato al team
    const calendario = await Calendario.findOne({
      where: { team_id: idTeam },
    });

    if (!calendario) {
      return res.status(404).json({ message: "Calendario non trovato" });
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
    res.status(201).json(nuovoEvento);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Errore durante la creazione dell'evento" });
  }
});

// Endpoint per modificare un evento
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titolo, descrizione, data_inizio, data_fine, nota } = req.body;

  const idLoggedUser = req.user?.id;

  try {
    // Trova l'evento esistente
    const evento: Model<EventoModel> | null = await Evento.findByPk(id);

    if (!evento) {
      return res.status(404).json({ message: "Evento non trovato" });
    }

    // Trova il team associato all'evento
    const team: Model<TeamModel> | null = await Team.findByPk(
      evento.dataValues.team_id,
      {
        include: [{ model: Utente, as: "utenti", through: { attributes: [] } }],
      }
    );

    if (!team) {
      return res.status(404).json({ message: "Team non trovato" });
    }

    // Verifica se l'utente autenticato è un membro del team
    const isUserInTeam = team.dataValues.utenti?.some(
      (utente) => utente.dataValues.id === idLoggedUser
    );

    if (!isUserInTeam) {
      return res
        .status(403)
        .json({ message: "Non sei autorizzato a modificare questo evento" });
    }

     // Crea la nuova nota associata all'utente
     const nuovaNota: Model<NoteModel> = await Note.create({
      contenuto: nota,
      utente_id: idLoggedUser,
    });


    // Aggiorna l'evento con i nuovi dati
    await evento.update({
      titolo: titolo || evento.dataValues?.titolo,
      descrizione: descrizione || evento.dataValues?.descrizione,
      data_inizio: data_inizio || evento.dataValues?.data_inizio,
      data_fine: data_fine || evento.dataValues?.data_fine,
      calendario_id: evento.dataValues?.calendario_id,
      note_id: nuovaNota.dataValues.id,
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

    return res.json(evento);
  } catch (error) {
    console.error("Errore durante la modifica dell'evento:", error);
    return res
      .status(500)
      .json({ message: "Errore durante la modifica dell'evento" });
  }
});

// Endpoint per eliminare un evento
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const idLoggedUser = req.user?.id;

  try {
    // Trova l'evento esistente
    const evento: Model<EventoModel> | null = await Evento.findByPk(id);

    if (!evento) {
      return res.status(404).json({ message: "Evento non trovato" });
    }

    // Trova il team associato all'evento
    const team: Model<TeamModel> | null = await Team.findByPk(
      evento.dataValues.team_id,
      {
        include: [{ model: Utente, as: "utenti", through: { attributes: [] } }],
      }
    );

    if (!team) {
      return res.status(404).json({ message: "Team non trovato" });
    }

    // Verifica se l'utente autenticato è un membro del team
    const isUserInTeam = team.dataValues.utenti?.some(
      (utente) => utente.dataValues.id === idLoggedUser
    );

    if (!isUserInTeam) {
      return res
        .status(403)
        .json({ message: "Non sei autorizzato a eliminare questo evento" });
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
            `è stato modificato un evento nel calendario da ${req.user?.name}`
          );
        }
      }
    }

    return res.json({ message: "Evento eliminato con successo" });
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'evento:", error);
    return res
      .status(500)
      .json({ message: "Errore durante l'eliminazione dell'evento" });
  }
});

export default router;
