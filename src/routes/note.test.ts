import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../"; // Importa la tua app Express
import { Note } from "../db-models/note";
import { Utente } from "../db-models/user";
import { __JWT_SECRET__ } from "../constants/environment";

jest.mock('../utils/sequelize', () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  define: jest.fn(),
  sync: jest.fn(),
}));

// Mock delle dipendenze
jest.mock("../db-models/note", () => ({
  Note: {
    // Mock delle funzioni di Sequelize
    belongsTo: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));
jest.mock("../db-models/user", () => ({
  Utente: {
    // Mock delle funzioni di Sequelize
    hasMany: jest.fn(),
    belongsToMany: jest.fn(),
  },
}) );
jest.mock("../db-models/priority", () => ({
  Priority: {
    // Mock delle funzioni di Sequelize
    findAll: jest.fn(),
    belongsTo: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock("../db-models/expense", () => ({
  Spesa: {
    // Mock delle funzioni di Sequelize
    belongsTo: jest.fn(),
  },
}));

jest.mock("../db-models/team", () => ({
  Team: {
    // Mock delle funzioni di Sequelize
    belongsToMany: jest.fn(),
  },
}));

jest.mock("../db-models/event", () => ({
  Evento: {
    // Mock delle funzioni di Sequelize
    belongsTo: jest.fn(),
  },
}));

jest.mock("../db-models/calendar", () => ({
  Calendario: {
    // Mock delle funzioni di Sequelize
    hasMany: jest.fn(),
  },
}));

jest.mock("../db-models/useful-links", () => ({
  LinkUtili: {
    // Mock delle funzioni di Sequelize
    belongsTo: jest.fn(),
  },
}));

// Utente mock per il test
const mockUser = {
  id: 1,
  nome: "Utente Test",
  email: "test@example.com",
};

// Genera il token JWT mock
const mockToken = jwt.sign(
  { id: mockUser.id, email: mockUser.email },
  __JWT_SECRET__
);

// Funzione di setup globale per Jest (puoi utilizzare un file di setup separato)
beforeEach(() => {
  jest.clearAllMocks(); // Ripulisci i mock prima di ogni test
});

describe("API Note Endpoints", () => {
  // Test per recuperare tutte le note
  it("GET /note - Recupera tutte le note", async () => {
    const mockNotes = [
      { id: 1, contenuto: "Test Nota", data_creazione: new Date() },
    ];
    (Note.findAll as jest.Mock).mockResolvedValue(mockNotes);

    const response = await request(app)
      .get("/note")
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNotes);
  });

  // Test per recuperare le note di un utente
  it("GET /note/utente - Recupera le note di un utente", async () => {
    const mockNotes = [
      {
        id: 1,
        contenuto: "Test Nota Utente",
        priority: { id: 1, name: "Alta" },
      },
    ];
    (Note.findAll as jest.Mock).mockResolvedValue(mockNotes);

    const response = await request(app)
      .get("/note/utente")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNotes);
  });

  // Test per creare una nuova nota
  it("POST /note - Crea una nuova nota", async () => {
    const mockNewNote = { id: 1, contenuto: "Nuova Nota", utente_id: 1 };

    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (Note.create as jest.Mock).mockResolvedValue(mockNewNote);

    const response = await request(app)
      .post("/note")
      .send({
        contenuto: "Nuova Nota",
        reminderDate: new Date(),
        token: "token-mock",
        priorita: 1,
      })
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockNewNote);
  });

  // Test per marcare una nota come completata
  it("PATCH /note/:id/marca-completata - Marca una nota come completata", async () => {
    const mockNote = {
      id: 1,
      contenuto: "Nota da completare",
      completed: false,
      update: jest.fn().mockResolvedValue({
        id: 1,
        contenuto: "Nota da completare",
        completed: true,
      }),
    };
    (Note.findByPk as jest.Mock).mockResolvedValue(mockNote);
    (mockNote.update as jest.Mock).mockResolvedValue({
      ...mockNote,
      completed: true,
    });

    const response = await request(app)
      .patch("/note/1/marca-completata")
      .send({ completed: true })
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(true);
  });

  // Test per aggiornare una nota
  it("PUT /note/:id - Aggiorna una nota", async () => {
    const mockNote = {
      id: 1,
      contenuto: "Nota da aggiornare",
      reminder_date: null,
      priority_id: 2,
      update: jest.fn().mockResolvedValue({
        id: 1,
        contenuto: "Nota da completare",
        completed: true,
      }),
    };
    (Note.findByPk as jest.Mock).mockResolvedValue(mockNote);
    (mockNote.update as jest.Mock).mockResolvedValue({
      ...mockNote,
      contenuto: "Nota aggiornata",
    });

    const response = await request(app)
      .put("/note/1")
      .send({
        contenuto: "Nota aggiornata",
        reminderDate: new Date(),
        priorita: 2,
      })
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect(response.body.contenuto).toBe("Nota aggiornata");
  });

  // Test per eliminare una nota
  it("DELETE /note/:id - Elimina una nota", async () => {
    const mockNote = { id: 1, contenuto: "Nota da eliminare" };
    (Note.findByPk as jest.Mock).mockResolvedValue(mockNote);

    const response = await request(app)
      .delete("/note/1")
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Nota eliminata");
  });
});
