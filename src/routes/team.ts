import { Team } from "../db-models/team";
import { Request, Response, Router } from "express";
import { Utente } from "../db-models/user";
import jwtMiddleware from "../middleware/jwt";
import { UtenteTeam } from "../db-models/user-team";
import { Calendario } from "../db-models/calendar";
import { DateTime } from "luxon";
import { Model } from "sequelize";
import { TeamModel } from "../models/team";
import { UserModel } from "../models/user";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req, res) => {
  try {
    const teams = await Team.findAll();
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero dei team");
  }
});

// Route per ottenere tutti i team di un utente
router.get("/utente", async (req, res) => {
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
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // Recupera tutti i team associati all'utente
    const teams = utente.dataValues.team;

    res.status(200).json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nel recupero dei team" });
  }
});

// API per recuperare un team per ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).send("Team non trovato");
    }
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero del team");
  }
});

router.post("/utente", async (req, res) => {
  const { nome, descrizione, colore, utentiIds } = req.body;
  const idUtente = req.user?.id;

  try {
    const utente = await Utente.findByPk(idUtente);

    if (!utente) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    const nuovoTeam = await Team.create({ nome, descrizione, colore });

    // Associa l'utente al team
    await UtenteTeam.create({
      utente_id: idUtente,
      team_id: nuovoTeam.dataValues.id,
    });

    const utenti = await Utente.findAll({ where: { id: utentiIds } });

    if (utenti.length !== utentiIds.length) {
      return res
        .status(400)
        .json({ message: "Alcuni utenti non sono stati trovati" });
    }

    // Aggiunge gli utenti al team
    await Promise.all((utentiIds as Array<number>).map(async (id) => {
      return await UtenteTeam.create({
        utente_id: id,
        team_id: nuovoTeam.dataValues.id,
      });
    }));

    await Calendario.create({
      nome: `Calendario ${nome}`,
      descrizione: `Calendario principale per ${nome}`,
      team_id: nuovoTeam.dataValues.id,
    });

    res.status(201).json(nuovoTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore nella creazione del team" });
  }
});

// Modifica del team
router.put("/:id", async (req: Request, res: Response) => {
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
      return res.status(404).json({ message: "Team non trovato" });
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

      console.log(userIdsToAdd, "to add");
      console.log(usersToRemove, "to remove");

      await Promise.all((usersToAdd as Array<number>).map(async (id) => {
        return await UtenteTeam.create(
          {
            utente_id: id,
            team_id: team.dataValues.id,
          },
          { ignoreDuplicates: true }
        );
      }));

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

    res.json({ message: "Team aggiornato con successo" });
  } catch (error) {
    console.error("Errore durante l'aggiornamento del team:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

// Nuovo endpoint per cancellazione logica
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Trova il team per ID
    const team: Model<TeamModel> | null = await Team.findByPk(id);

    if (!team) {
      return res.status(404).json({ message: "Team non trovato" });
    }

    // Effettua la cancellazione logica impostando il flag attivo su false
    await team.update({ attivo: false, data_disattivo: DateTime.now() });

    res.json({ message: "Team disattivato con successo" });
  } catch (error) {
    console.error("Errore durante la disattivazione del team:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

export default router;
