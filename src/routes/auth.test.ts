import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import request from "supertest";
import { Utente } from "../db-models/user";
import { __BASE_PATH__ } from "../constants/environment";
import { generateConfirmationToken } from "../utils/generate-confirmation-token";
import { sendConfirmationEmail } from "../utils/send-email";
import { app } from "..";
import { Team } from "../db-models/team";
import { mockedFakeToken } from "../mocks/jest-logged-user";
import { DateTime } from "luxon";

// Mocking utility functions
jest.mock("../utils/generate-confirmation-token");
jest.mock("../utils/send-email");

const jwtToken = jest.fn().mockResolvedValue(mockedFakeToken);
(jwt.sign as jest.Mock) = jwtToken;

const jwtTokenVerify = jest.fn().mockResolvedValue(true);
(jwt.verify as jest.Mock) = jwtTokenVerify;

describe("Test API Auth", () => {

  // POST verifica utenza
  describe(`POST ${__BASE_PATH__}/autenticazione/verifica-utenza`, () => {
    it("Dovrebbe restituire 200 se l'utente viene trovato e la password è valida", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue({
        dataValues: { password: "hashedPassword" },
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/verifica-utenza`)
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
    });

    it("Dovrebbe restituire 404 se l'utente non viene trovato", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/verifica-utenza`)
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Utente non trovato");
    });

    it("Dovrebbe restituire 401 se la password non è valida", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue({
        dataValues: { password: "hashedPassword" },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/verifica-utenza`)
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Password errata");
    });
  });

  // POST login
  describe(`POST ${__BASE_PATH__}/autenticazione/login`, () => {
    it("Dovrebbe restituire 200 e un token JWT valido se il login ha successo", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue({
        dataValues: {
          id: 1,
          email: "test@example.com",
          password: "hashedPassword",
          nome: "Test User",
          two_factor_enabled: false,
        },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockedFakeToken);

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/login`)
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe(mockedFakeToken);
    });

    it("Dovrebbe restituire 404 se l'utente non viene trovato", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/login`)
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Utente non trovato");
    });

    it("Dovrebbe restituire 401 se la password non è valida", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue({
        dataValues: { password: "hashedPassword" },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/login`)
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Password errata");
    });
  });

  // POST registrazione
  describe(`POST ${__BASE_PATH__}/autenticazione/registrazione`, () => {
    it("Dovrebbe restituire 201 se la registrazione dell'utente è avvenuta con successo", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue(null);
      (generateConfirmationToken as jest.Mock).mockReturnValue(
        "confirmation-token"
      );
      (sendConfirmationEmail as jest.Mock).mockResolvedValue(true);
      (Utente.create as jest.Mock).mockResolvedValue({
        dataValues: { id: 1, email: "test@example.com", nome: "Test User" },
      });

      (Team.create as jest.Mock).mockResolvedValue({
        dataValues: { id: 1 },
      });

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/registrazione`)
        .send({
          nome: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe("test@example.com");
    });

    it("Dovrebbe restituire 400 se l'email è già in uso", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/registrazione`)
        .send({
          nome: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.text).toBe("L'email è già in uso.");
    });
  });

  // POST reinvia conferma
  describe(`POST ${__BASE_PATH__}/autenticazione/reinvia-conferma`, () => {
    it("Dovrebbe reinviare la conferma email e restituire 200", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue({
        dataValues: {
          email: "test@example.com",
          email_confermata: false,
        },
        update: jest.fn(),
      });
      (generateConfirmationToken as jest.Mock).mockReturnValue(
        "new-confirmation-token"
      );
      (sendConfirmationEmail as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/reinvia-conferma`)
        .send({ email: "test@example.com" });

      expect(res.status).toBe(200);
      expect(res.text).toBe(
        "Nuova email di conferma inviata. Controlla la tua casella di posta."
      );
    });

    it("Dovrebbe restituire 404 se l'utente non viene trovato", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/reinvia-conferma`)
        .send({ email: "nonexistent@example.com" });

      expect(res.status).toBe(404);
      expect(res.text).toBe("Utente non trovato.");
    });

    it("Dovrebbe restituire 400 se l'email è già confermata", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue({
        dataValues: { email: "test@example.com", email_confermata: true },
        update: jest.fn(),
      });

      const res = await request(app)
        .post(`${__BASE_PATH__}/autenticazione/reinvia-conferma`)
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.text).toBe("L'utente ha già confermato l'email.");
    });
  });

  describe(`GET ${__BASE_PATH__}/conferma-email/:token`, () => {
    it("Dovrebbe restituire un errore se il token non è valido", async () => {
      (Utente.findOne as jest.Mock).mockResolvedValue(null); // Mock per simulare un utente non trovato

      const response = await request(app).get(
        `${__BASE_PATH__}/autenticazione/conferma-email/invalidToken`
      );

      expect(response.status).toBe(400);
      expect(response.text).toBe("Token non valido o già utilizzato.");
    });

    it("Dovrebbe restituire un errore se il token è scaduto", async () => {
      const mockUser = {
        dataValues: {
          scadenza_token: DateTime.now().minus({ minutes: 1 }).toISO(), // Simula un token scaduto
        },
        update: jest.fn(),
      };

      (Utente.findOne as jest.Mock).mockResolvedValue(mockUser); // Mock per simulare un utente trovato

      const response = await request(app).get(
        `${__BASE_PATH__}/autenticazione/conferma-email/validToken`
      );

      expect(response.status).toBe(400);
      expect(response.text).toBe("Il token di conferma è scaduto.");
    });

    it("Dovrebbe confermare l'email se il token è valido", async () => {
      const mockUser = {
        dataValues: {
          scadenza_token: DateTime.now().plus({ minutes: 15 }).toISO(), // Simula un token valido
        },
        update: jest.fn(),
      };

      (Utente.findOne as jest.Mock).mockResolvedValue(mockUser); // Mock per simulare un utente trovato

      const response = await request(app).get(
        `${__BASE_PATH__}/autenticazione/conferma-email/validToken`
      );

      expect(response.status).toBe(200);
      expect(response.text).toBe(
        "Email confermata con successo! Ora puoi effettuare il login."
      );
      expect(mockUser.update).toHaveBeenCalledWith({
        token_verifica: null,
        email_confermata: true,
        scadenza_token: null,
      });
    });

    it("Dovrebbe restituire un errore in caso di errore del server", async () => {
      (Utente.findOne as jest.Mock).mockImplementation(() => {
        throw new Error("Errore del server"); // Simula un errore del server
      });

      const response = await request(app).get(
        `${__BASE_PATH__}/autenticazione/conferma-email/validToken`
      );

      expect(response.status).toBe(500);
      expect(response.text).toBe("Errore");
    });
  });
});
