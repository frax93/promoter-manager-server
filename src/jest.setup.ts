import { Server } from "http";
import { app } from ".";
import { __PORT__ } from "./constants/environment";

let server: Server;

beforeAll(() => {
  server = app.listen(__PORT__);
});

afterAll((done) => {
  server.close(done); // Chiude il server al termine di tutti i test
});
jest.mock("./utils/sequelize", () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  define: jest.fn(),
  sync: jest.fn(),
  close: jest.fn(),
}));

// Mock delle dipendenze
jest.mock("./db-models/note", () => ({
  Note: {
    // Mock delle funzioni di Sequelize
    belongsTo: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("./db-models/user", () => ({
  Utente: {
    // Mock delle funzioni di Sequelize
    hasMany: jest.fn(),
    belongsToMany: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock("./db-models/priority", () => ({
  Priority: {
    // Mock delle funzioni di Sequelize
    findAll: jest.fn(),
    belongsTo: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock("./db-models/expense", () => ({
  Spesa: {
    // Mock delle funzioni di Sequelize
    belongsTo: jest.fn(),
  },
}));

jest.mock("./db-models/team", () => ({
  Team: {
    // Mock delle funzioni di Sequelize
    belongsToMany: jest.fn(),
  },
}));

jest.mock("./db-models/event", () => ({
  Evento: {
    // Mock delle funzioni di Sequelize
    belongsTo: jest.fn(),
  },
}));

jest.mock("./db-models/calendar", () => ({
  Calendario: {
    // Mock delle funzioni di Sequelize
    hasMany: jest.fn(),
  },
}));

jest.mock("./db-models/useful-links", () => ({
  LinkUtili: {
    // Mock delle funzioni di Sequelize
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("./db-models/type", () => ({
  Tipo: {
    // Mock delle funzioni di Sequelize
    findAll: jest.fn(),
  },
}));

// Funzione di setup globale per Jest (puoi utilizzare un file di setup separato)
beforeEach(() => {
  jest.clearAllMocks(); // Ripulisci i mock prima di ogni test
});
