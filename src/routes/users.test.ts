import request from "supertest";
import { app } from "../"; // Importa la tua app Express
import { Utente } from "../db-models/user";
import { Team } from "../db-models/team";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { __BASE_PATH__, __JWT_SECRET__ } from "../constants/environment";
import { mockedFakeToken, mockToken } from "../mocks/jest-logged-user";

const jwtToken = jest.fn().mockResolvedValue(mockedFakeToken);
(jwt.sign as jest.Mock) = jwtToken;

jest.mock("../utils/send-email");

describe("API Utente Endpoints", () => {

  // Test per recuperare tutti gli utenti
  it("GET / - Recupera tutti gli utenti", async () => {
    const mockUtenti = [
      { id: 1, nome: "Utente 1", email: "utente1@example.com" },
      { id: 2, nome: "Utente 2", email: "utente2@example.com" },
    ];

    (Utente.findAll as jest.Mock).mockResolvedValue(mockUtenti);

    const response = await request(app)
      .get(`${__BASE_PATH__}/utenti`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUtenti);
  });

  // Test per abilitare la 2FA
  it("GET /abilita-2fa - Abilita 2FA", async () => {
    const mockUser = {
      dataValues: { id: 1, email: "user@example.com" },
      update: jest.fn(),
    };
    
    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .get(`${__BASE_PATH__}/utenti/abilita-2fa`)
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("2FA abilitata con successo");
  });

  // Test per disabilitare la 2FA
  it("GET /disabilita-2fa - Disabilita 2FA", async () => {
    const mockUser = { id: 1, update: jest.fn() };
    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .get(`${__BASE_PATH__}/utenti/disabilita-2fa`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toEqual("2FA disabilitata con successo");
  });

  // Test per recuperare un utente per ID
  it("GET /:id - Recupera un utente", async () => {
    const mockUtente = { id: 1, nome: "Utente 1", email: "utente1@example.com" };
    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUtente);

    const response = await request(app)
      .get(`${__BASE_PATH__}/utenti/1`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUtente);
  });

  // Test per aggiornare le informazioni di un utente
  it("PUT /:id - Aggiorna un utente", async () => {
    const mockUtente = { id: 1, update: jest.fn() };
    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUtente);

    const response = await request(app)
      .put(`${__BASE_PATH__}/utenti/1`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send({
        referralLink: "new-referral",
        linkAzienda: "new-azienda",
        linkVideo: "new-video",
      });

    expect(response.status).toBe(200);
    expect(mockUtente.update).toHaveBeenCalledWith({
      referrallink: "new-referral",
      linkazienda: "new-azienda",
      linkvideo: "new-video",
    });
  });

  // Test per la disponibilità e l'invio dell'email
  it("POST /disponibilita - Invia disponibilità", async () => {
    const mockTeam = { id: 1, dataValues: { id: 1 }, utenti: [{ id: 1 }] };
    (Team.findOne as jest.Mock).mockResolvedValue(mockTeam);
    (jwt.sign as jest.Mock).mockReturnValue("mocked-token");

    const response = await request(app)
      .post(`${__BASE_PATH__}/utenti/disponibilita`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send({ emails: ["test@example.com"], token: "mock-token" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual("Email inoltrate con successo!");
  });

  // Test per cambiare la password
  it("POST /cambia-password - Cambia la password", async () => {
    const mockUtente = {
      dataValues: {
        id: 1,
        password: "oldPasswordHash",
      },
      update: jest.fn(),
    };
    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUtente);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Simula che la nuova password è diversa dalla vecchia
    (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");

    const response = await request(app)
      .post(`${__BASE_PATH__}/utenti/cambia-password`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send({ password: "newPassword" });

    expect(response.status).toBe(200);
    expect(response.text).toEqual("Cambio password effettuato con successo!");
    expect(mockUtente.update).toHaveBeenCalledWith(
      {
        password: "newHashedPassword",
      },
      { where: { id: mockUtente.dataValues.id } }
    );
  });

  // Test per gestire l'errore durante il cambio di password
  it("POST /cambia-password - Errore durante il cambio di password", async () => {
    (Utente.findByPk as jest.Mock).mockRejectedValue(new Error("Errore"));

    const response = await request(app)
      .post(`${__BASE_PATH__}/utenti/cambia-password`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send({ password: "newPassword" });

    expect(response.status).toBe(500);
    expect(response.text).toEqual("Errore");
  });
});
