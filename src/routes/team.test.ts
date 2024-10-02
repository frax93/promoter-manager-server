import request from "supertest";
import { app } from "../"; // Importa la tua app Express
import { Team } from "../db-models/team";
import { Utente } from "../db-models/user";
import { UtenteTeam } from "../db-models/user-team";
import { Calendario } from "../db-models/calendar";
import { mockToken } from "../mocks/jest-logged-user"; // Token mock
import { __BASE_PATH__ } from "../constants/environment"; // Base path

describe("API Team Endpoints", () => {
  // Test per recuperare tutti i team
  it(`GET ${__BASE_PATH__}/team - Recupera tutti i team`, async () => {
    const mockTeams = [
      { id: 1, nome: "Team 1", descrizione: "Descrizione 1" },
      { id: 2, nome: "Team 2", descrizione: "Descrizione 2" },
    ];

    (Team.findAll as jest.Mock).mockResolvedValue(mockTeams);

    const response = await request(app)
      .get(`${__BASE_PATH__}/team`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTeams);
  });

  // Test per recuperare i team di un utente
  it(`GET ${__BASE_PATH__}/team/utente - Recupera i team di un utente`, async () => {
    const mockUserTeams = [
      { id: 1, nome: "Team Utente 1", descrizione: "Descrizione 1" },
      { id: 2, nome: "Team Utente 2", descrizione: "Descrizione 2" },
    ];

    const mockUser = { dataValues: { id: 1, team: mockUserTeams } };
    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .get(`${__BASE_PATH__}/team/utente`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUserTeams);
  });

  // Test per creare un nuovo team
  it(`POST ${__BASE_PATH__}/team/utente - Crea un nuovo team`, async () => {
    const newTeam = {
      nome: "Nuovo Team",
      descrizione: "Descrizione",
      colore: "#FFFFFF",
      utentiIds: [2, 3],
    };

    const newCalendar = { nome: "", descrizione: "" };

    const mockCreatedTeam = { dataValues: { id: 1, ...newTeam } };

    const mockUser = { dataValues: { id: 1 } };

    const mockCalendar = {
      dataValues: { ...newCalendar, team_id: mockCreatedTeam.dataValues.id },
    };

    const mockUtenti = newTeam.utentiIds.map((id) => ({
      id,
    }));

    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUser);

    (Team.create as jest.Mock).mockResolvedValue(mockCreatedTeam);

    (Utente.findAll as jest.Mock).mockResolvedValue(mockUtenti);

    (Calendario.create as jest.Mock).mockResolvedValue(mockCalendar);

    const response = await request(app)
      .post(`${__BASE_PATH__}/team/utente`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send(newTeam);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockCreatedTeam);
  });

  // Test per gestire l'errore del server durante la creazione di un team
  it(`POST ${__BASE_PATH__}/team/utente - Errore del server durante la creazione del team`, async () => {
    const newTeam = {
      nome: "Nuovo Team",
      descrizione: "Descrizione",
      colore: "#FFFFFF",
      utentiIds: [2, 3],
    };

    (Utente.findByPk as jest.Mock).mockResolvedValue({ id: 1 });
    (Team.create as jest.Mock).mockImplementation(() => {
      throw new Error("Errore del server");
    });

    const response = await request(app)
      .post(`${__BASE_PATH__}/team/utente`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send(newTeam);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Errore nella creazione del team",
    });
  });

  // Test per modificare un team
  it(`PUT ${__BASE_PATH__}/team/:id - Modifica un team`, async () => {
    const updatedTeam = {
      nome: "Team Aggiornato",
      descrizione: "Descrizione aggiornata",
      colore: "#000000",
      utentiIds: [2, 3],
    };

    const mockTeam = {
      dataValues: {
        id: 1,
        utenti: [{ id: 2 }],
      },
      update: jest.fn().mockResolvedValue(updatedTeam),
    };

    const mockUtenti = updatedTeam.utentiIds.map((id) => ({
      dataValues: { id },
    }));

    (Team.findByPk as jest.Mock).mockResolvedValue(mockTeam);

    (Utente.findAll as jest.Mock).mockResolvedValue(mockUtenti);

    const response = await request(app)
      .put(`${__BASE_PATH__}/team/1`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send(updatedTeam);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Team aggiornato con successo" });
  });

  // Test per eliminare un team
  it(`DELETE ${__BASE_PATH__}/team/:id - Elimina un team`, async () => {
    const mockTeam = { id: 1, update: jest.fn() };

    (Team.findByPk as jest.Mock).mockResolvedValue(mockTeam);

    const response = await request(app)
      .delete(`${__BASE_PATH__}/team/1`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Team disattivato con successo" });
  });

  // Test per gestire l'errore durante il recupero di un team non trovato
  it(`GET ${__BASE_PATH__}/team/:id - Team non trovato`, async () => {
    (Team.findByPk as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get(`${__BASE_PATH__}/team/999`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.text).toEqual("Team non trovato");
  });

  // Test per verificare se viene trovato il team
  it(`GET ${__BASE_PATH__}/team/:id - Team trovato`, async () => {
    const team = { id: 1 };
    (Team.findByPk as jest.Mock).mockResolvedValue(team);

    const response = await request(app)
      .get(`${__BASE_PATH__}/team/1`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(team);
  });

    // Test per gestire l'errore durante il recupero di un team 
    it(`GET ${__BASE_PATH__}/team/:id - Team`, async () => {
        (Team.findByPk as jest.Mock).mockImplementation(() => {
          throw new Error("Errore");
        });
    
        const response = await request(app)
          .get(`${__BASE_PATH__}/team/1`)
          .set("Authorization", `Bearer ${mockToken}`);
    
        expect(response.status).toBe(500);
        expect(response.text).toEqual("Errore nel recupero del team");
      });
});
