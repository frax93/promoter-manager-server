import request from "supertest";
import { app } from "../"; // Importa la tua app Express
import { Calendario } from "../db-models/calendar"; // Importa il modello Calendario
import { Evento } from "../db-models/event"; // Importa il modello Evento
import { Spesa } from "../db-models/expense"; // Importa il modello Spesa
import { Team } from "../db-models/team"; // Importa il modello Team
import { Utente } from "../db-models/user"; // Importa il modello Utente
import { __BASE_PATH__ } from "../constants/environment";
import { mockToken } from "../mocks/jest-logged-user"; // Assicurati di avere un token mock per i test
import { EventoModel } from "../models/event";
import { Note } from "../db-models/note";

describe("API Eventi Endpoints", () => {
  // Test per recuperare tutti gli eventi
  it(`GET ${__BASE_PATH__}/eventi - Recupera tutti gli eventi`, async () => {
    const mockEvents = [
      {
        id: 1,
        titolo: "Evento 1",
        data_inizio: new Date(),
        data_fine: new Date(),
      },
      {
        id: 2,
        titolo: "Evento 2",
        data_inizio: new Date(),
        data_fine: new Date(),
      },
    ];

    (Evento.findAll as jest.Mock).mockResolvedValue(mockEvents);

    const response = await request(app)
      .get(`${__BASE_PATH__}/eventi`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(
      response.body.map((event: EventoModel) => ({
        ...event,
        data_inizio: new Date(event.data_inizio), // Trasforma la data in stringa ISO
        data_fine: new Date(event.data_fine), // Trasforma la data in stringa ISO
      }))
    ).toEqual(mockEvents);
  });

  // Test per recuperare le spese associate a un evento
  it(`GET ${__BASE_PATH__}/eventi/:id/spese - Recupera le spese di un evento`, async () => {
    const mockExpenses = [
      { id: 1, descrizione: "Spesa 1", importo: 100 },
      { id: 2, descrizione: "Spesa 2", importo: 200 },
    ];

    (Spesa.findAll as jest.Mock).mockResolvedValue(mockExpenses);

    const response = await request(app)
      .get(`${__BASE_PATH__}/eventi/1/spese`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockExpenses);
  });

  // Test per recuperare gli eventi di un utente
  it(`GET ${__BASE_PATH__}/eventi/utente - Recupera eventi di un utente`, async () => {
    const mockUserEvents = [
      { id: 1, titolo: "Evento Utente 1" },
      { id: 2, titolo: "Evento Utente 2" },
    ];

    (Utente.findByPk as jest.Mock).mockResolvedValue({
      dataValues: {
        team: [
          {
            calendario: {
              dataValues: {
                eventi: mockUserEvents,
              },
            },
          },
        ],
      },
    });

    const response = await request(app)
      .get(`${__BASE_PATH__}/eventi/utente`)
      .set("Authorization", `Bearer ${mockToken}`);
    
    const mockedResponse = [
      {
        team: {
          calendario: {
            dataValues: { eventi: mockUserEvents },
          },
        },
      },
      {
        team: {
          calendario: {
            dataValues: { eventi: mockUserEvents },
          },
        },
      },
    ];
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockedResponse);
  });

  // Test per creare un nuovo evento
  it(`POST ${__BASE_PATH__}/eventi - Crea un nuovo evento`, async () => {
    const newEvent = {
      titolo: "Nuovo Evento",
      descrizione: "Descrizione Evento",
      data_inizio: new Date(),
      data_fine: new Date(),
      teamId: 1,
    };

    (Team.findByPk as jest.Mock).mockResolvedValue({
      dataValues: {
        id: 1,
        utenti: [{ dataValues: { push_token: "token123", id: 1 } }],
      },
    });

    (Utente.findByPk as jest.Mock).mockResolvedValue({
      dataValues: {
        id: 1,
        team: [{ id: 1 }],
      },
    });

    (Calendario.findOne as jest.Mock).mockResolvedValue({
      dataValues: { id: 1 },
    });

    (Evento.create as jest.Mock).mockResolvedValue(newEvent);

    const response = await request(app)
      .post(`${__BASE_PATH__}/eventi`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send(newEvent);

    expect(response.status).toBe(201);
    expect({
      ...response.body,
      data_inizio: new Date(response.body.data_inizio), // Trasforma la data in stringa ISO
      data_fine: new Date(response.body.data_fine), // Trasforma la data in stringa ISO
    }).toEqual(newEvent);
  });

    // Test per modificare un evento
    it(`PUT ${__BASE_PATH__}/eventi/:id - Modifica un evento`, async () => {
      const updatedEvent = {
        titolo: "Evento Aggiornato",
        descrizione: "Descrizione Aggiornata",
        data_inizio: new Date(),
        data_fine: new Date(),
      };

      (Evento.findByPk as jest.Mock).mockResolvedValue({
        dataValues: { team_id: 1 },
        update: jest.fn().mockResolvedValue(updatedEvent),
      });

      (Team.findByPk as jest.Mock).mockResolvedValue({
        dataValues: {
          utenti: [{ dataValues: { id: 1 } }],
        },
      });

      (Note.create as jest.Mock).mockResolvedValue({ dataValues: { id: 1 } });

      const response = await request(app)
        .put(`${__BASE_PATH__}/eventi/1`)
        .set("Authorization", `Bearer ${mockToken}`)
        .send(updatedEvent);

      expect(response.status).toBe(200);

      expect({
        ...response.body,
        data_inizio: new Date(response.body.data_inizio), // Trasforma la data in stringa ISO
        data_fine: new Date(response.body.data_fine), // Trasforma la data in stringa ISO
      }).toEqual(updatedEvent);
    });

    // Test per eliminare un evento
    it(`DELETE ${__BASE_PATH__}/eventi/:id - Elimina un evento`, async () => {
      (Evento.findByPk as jest.Mock).mockResolvedValue({
        dataValues: { team_id: 1 },
        destroy: jest.fn(),
      });

      (Team.findByPk as jest.Mock).mockResolvedValue({
        dataValues: {
          utenti: [{ dataValues: { id: 1 } }],
        },
      });

      const response = await request(app)
        .delete(`${__BASE_PATH__}/eventi/1`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Evento eliminato con successo" });
    });

    // Test per gestire errori durante il recupero degli eventi
    it(`GET ${__BASE_PATH__}/eventi - Errore nel recupero degli eventi`, async () => {
      (Evento.findAll as jest.Mock).mockImplementation(() => {
        throw new Error("Errore del server"); // Simula un errore del server
      });

      const response = await request(app)
        .get(`${__BASE_PATH__}/eventi`)
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe("Errore nel recupero degli eventi");
    });

    // Test per gestire errori durante la creazione di un evento
    it(`POST ${__BASE_PATH__}/eventi - Errore durante la creazione dell'evento`, async () => {
      (Team.findByPk as jest.Mock).mockResolvedValue({
        dataValues: {
          id: 1,
          utenti: [{ dataValues: { push_token: "token123", id: 1 } }],
        },
      });

      (Utente.findByPk as jest.Mock).mockResolvedValue({
        dataValues: {
          id: 1,
          team: [{ id: 1 }],
        },
      });

      (Calendario.findOne as jest.Mock).mockResolvedValue({
        dataValues: { id: 1 },
      });
      (Evento.create as jest.Mock).mockImplementation(() => {
        throw new Error("Errore del server"); // Simula un errore del server
      });

      const response = await request(app)
        .post(`${__BASE_PATH__}/eventi`)
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ titolo: "Evento" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Errore durante la creazione dell'evento",
      });
    });
});
