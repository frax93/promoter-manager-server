import request from "supertest";
import { app } from "../"; // Importa la tua app Express
import { Note } from "../db-models/note";
import { NoteModel } from "../models/note";
import { __BASE_PATH__ } from "../constants/environment";
import { Utente } from "../db-models/user";
import { mockUser, mockToken } from "../mocks/jest-logged-user";


describe("API Note Endpoints", () => {
  // Test per recuperare tutte le note
  it(`GET ${__BASE_PATH__}/note - Recupera tutte le note`, async () => {
    const mockNotes = [
      { id: 1, contenuto: "Test Nota", data_creazione: new Date() },
    ];
    (Note.findAll as jest.Mock).mockResolvedValue(mockNotes);

    const response = await request(app)
      .get(`${__BASE_PATH__}/note`)
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);

    expect(
      response.body.map((note: NoteModel) => ({
        ...note,
        data_creazione: new Date(note.data_creazione), // Trasforma la data in stringa ISO
      }))
    ).toEqual(mockNotes);
  });

  // Test per recuperare le note di un utente
  it(`GET ${__BASE_PATH__}/note/utente - Recupera le note di un utente`, async () => {
    const mockNotes = [
      {
        id: 1,
        contenuto: "Test Nota Utente",
        priority: { id: 1, name: "Alta" },
      },
    ];
    (Note.findAll as jest.Mock).mockResolvedValue(mockNotes);

    const response = await request(app)
      .get(`${__BASE_PATH__}/note/utente`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNotes);
  });

  // Test per creare una nuova nota
  it(`POST ${__BASE_PATH__}/note - Crea una nuova nota`, async () => {
    const mockNewNote = { id: 1, contenuto: "Nuova Nota", utente_id: 1 };

    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (Note.create as jest.Mock).mockResolvedValue(mockNewNote);

    const response = await request(app)
      .post(`${__BASE_PATH__}/note`)
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
  it(`PATCH ${__BASE_PATH__}/note/:id/marca-completata - Marca una nota come completata`, async () => {
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
      .patch(`${__BASE_PATH__}/note/1/marca-completata`)
      .send({ completed: true })
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(true);
  });

  // Test per aggiornare una nota
  it(`PUT ${__BASE_PATH__}/note/:id - Aggiorna una nota`, async () => {
    const mockNote = {
      id: 1,
      contenuto: "Nota da aggiornare",
      reminder_date: null,
      priority_id: 2,
      update: jest.fn().mockResolvedValue({
        id: 1,
        contenuto: "Nota aggiornata",
        priorita: 2,
        completed: true,
      }),
    };

    (Note.findByPk as jest.Mock).mockResolvedValue(mockNote);

    mockNote.update.mockResolvedValue({
      ...mockNote,
      contenuto: "Nota aggiornata",
    });

    const response = await request(app)
      .put(`${__BASE_PATH__}/note/1`)
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
  it(`DELETE ${__BASE_PATH__}/note/:id - Elimina una nota`, async () => {
    const mockNote = {
      id: 1,
      contenuto: "Nota da eliminare",
      destroy: jest.fn(),
    };

    (Note.findByPk as jest.Mock).mockResolvedValue(mockNote);

    const response = await request(app)
      .delete(`${__BASE_PATH__}/note/1`)
      .set("Authorization", `Bearer ${mockToken}`); // Usa il token mock

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Nota eliminata");
  });
});
