import { Server } from "http";
import { app } from ".";
import { __PORT__ } from "./constants/environment";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mockedFakeToken } from "./mocks/jest-logged-user";

let server: Server;

// Crea server mock prima dei test
beforeAll(() => {
  server = app.listen(__PORT__);
});

// Chiude server mock alla fine dei test
afterAll((done) => {
  server.close(done); // Chiude il server al termine di tutti i test
});

// Mock di bcrypt
const bcryptCompareRejected = jest.fn().mockRejectedValue(new Error('Random error'));
(bcrypt.compare as jest.Mock) = bcryptCompareRejected;

const bcryptCompare = jest.fn().mockResolvedValue(true);
(bcrypt.compare as jest.Mock) = bcryptCompare;

const jwtToken = jest.fn().mockResolvedValue(mockedFakeToken);
(jwt.sign as jest.Mock) = jwtToken;

// Mock della connessione al db
jest.mock("./utils/sequelize", () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  define: jest.fn(),
  sync: jest.fn(),
  close: jest.fn(),
}));

// Mock dei modelli del db
jest.mock("./db-models/note", () => ({
  Note: {
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
    hasMany: jest.fn(),
    belongsToMany: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("./db-models/priority", () => ({
  Priority: {
    findAll: jest.fn(),
    belongsTo: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock("./db-models/expense", () => ({
  Spesa: {
    belongsTo: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("./db-models/team", () => ({
  Team: {
    belongsToMany: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("./db-models/user-team", () => ({
  UtenteTeam: {
    belongsTo: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("./db-models/event", () => ({
  Evento: {
    belongsTo: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("./db-models/calendar", () => ({
  Calendario: {
    hasMany: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock("./db-models/useful-links", () => ({
  LinkUtili: {
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
    findAll: jest.fn(),
  },
}));

// Funzione per fare il clear dei mock ad ogni giro di test
beforeEach(() => {
  jest.clearAllMocks(); // Ripulisci i mock prima di ogni test
});
