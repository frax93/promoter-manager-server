import request from "supertest";
import { app } from "../"; // Importa la tua app Express
import { Calendario } from "../db-models/calendar"; // Importa il modello Calendario
import { Evento } from "../db-models/event"; // Importa il modello Evento
import { __BASE_PATH__ } from "../constants/environment";
import { mockToken } from "../mocks/jest-logged-user"; // Assicurati di avere un token mock per i test
import { EventoModel } from "../models/event";

jest.mock("../db-models/calendar"); // Mock del modello Calendario
jest.mock("../db-models/event"); // Mock del modello Evento

describe("API Calendario Endpoints", () => {
  // Test per recuperare tutti i calendari
  it(`GET ${__BASE_PATH__}/calendari - Recupera tutti i calendari`, async () => {
    const mockCalendars = [
      { id: 1, nome: "Calendario 1" },
      { id: 2, nome: "Calendario 2" },
    ];
    
    (Calendario.findAll as jest.Mock).mockResolvedValue(mockCalendars);

    const response = await request(app)
      .get(`${__BASE_PATH__}/calendari`)
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCalendars);
  });

  // Test per recuperare gli eventi associati a un calendario
  it(`GET ${__BASE_PATH__}/calendari/:id/eventi - Recupera gli eventi di un calendario`, async () => {
    const mockEvents = [
      { id: 1, titolo: "Evento 1", data_inizio: new Date(), data_fine: new Date() },
      { id: 2, titolo: "Evento 2", data_inizio: new Date(), data_fine: new Date() },
    ];
    
    const mockCalendar = {
      id: 1,
      nome: "Calendario 1",
      eventi: mockEvents,
    };

    (Calendario.findByPk as jest.Mock).mockResolvedValue(mockCalendar); // Mock per simulare la ricerca del calendario

    const response = await request(app)
      .get(`${__BASE_PATH__}/calendari/1/eventi`)
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect({
      ...(response.body || {}),
      eventi: response.body?.eventi.map((event: EventoModel) => ({
        ...event,
        data_inizio: new Date(event.data_inizio), // Trasforma la data in stringa ISO
        data_fine: new Date(event.data_fine), // Trasforma la data in stringa ISO
      })),
    }).toEqual(mockCalendar);
  });

  // Test per gestire caso in cui il calendario non esiste
  it(`GET ${__BASE_PATH__}/calendari/:id/eventi - Nessun calendario trovato`, async () => {
    (Calendario.findByPk as jest.Mock).mockResolvedValue(null); // Simula la mancanza di un calendario

    const response = await request(app)
      .get(`${__BASE_PATH__}/calendari/999/eventi`)
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(404);
    expect(response.text).toBe("Nessun evento trovato per il calendario");
  });

  // Test per gestire errori durante il recupero dei calendari
  it(`GET ${__BASE_PATH__}/calendari - Errore nel recupero dei calendari`, async () => {
    (Calendario.findAll as jest.Mock).mockImplementation(() => {
      throw new Error("Errore del server"); // Simula un errore del server
    });

    const response = await request(app)
      .get(`${__BASE_PATH__}/calendari`)
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(500);
    expect(response.text).toBe("Errore nel recupero dei calendari");
  });

  // Test per gestire errori durante il recupero degli eventi
  it(`GET ${__BASE_PATH__}/calendari/:id/eventi - Errore nel recupero degli eventi`, async () => {
    (Calendario.findByPk as jest.Mock).mockImplementation(() => {
      throw new Error("Errore del server"); // Simula un errore del server
    });

    const response = await request(app)
      .get(`${__BASE_PATH__}/calendari/1/eventi`)
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(500);
    expect(response.text).toBe("Errore nel recupero degli eventi");
  });
});
