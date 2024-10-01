import request from "supertest";
import { app } from "../"; // Importa la tua app Express
import { Spesa } from "../db-models/expense"; // Importa il modello Spesa
import { Utente } from "../db-models/user"; // Importa il modello Utente
import { Tipo } from "../db-models/type"; // Importa il modello Tipo
import { mockToken } from "../mocks/jest-logged-user"; // Assicurati di avere un token mock per i test
import { __BASE_PATH__ } from "../constants/environment"; // Importa la tua costante di base

describe("API Spese Endpoints", () => {
  
  // Test per recuperare tutte le spese
  it(`GET ${__BASE_PATH__}/spese - Recupera tutte le spese`, async () => {
    const mockSpese = [
      { id: 1, descrizione: "Spesa 1", importo: 100 },
      { id: 2, descrizione: "Spesa 2", importo: 200 },
    ];

    (Spesa.findAll as jest.Mock).mockResolvedValue(mockSpese);

    const response = await request(app)
      .get(`${__BASE_PATH__}/spese`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSpese);
  });

  // Test per recuperare le spese di un utente
  it(`GET ${__BASE_PATH__}/spese/utente - Recupera spese di un utente`, async () => {
    const mockUserSpese = [
      { id: 1, descrizione: "Spesa Utente 1", importo: 100 },
      { id: 2, descrizione: "Spesa Utente 2", importo: 200 },
    ];

    (Spesa.findAll as jest.Mock).mockResolvedValue(mockUserSpese);
    const mockUser = { id: 1, nome: '' };
    jest.spyOn(Utente, "findByPk").mockResolvedValue(mockUser as any);

    const response = await request(app)
      .get(`${__BASE_PATH__}/spese/utente`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUserSpese);
  });

  // Test per creare una nuova spese
  it(`POST ${__BASE_PATH__}/spese - Crea una nuova spese`, async () => {
    const newSpesa = {
      descrizione: "Nuova Spesa",
      importo: 150,
      tipoId: 1,
      guadagno_spese: false,
      tipo_importo: "uscita",
    };

    const mockUser = { id: 1 };
    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (Tipo.findByPk as jest.Mock).mockResolvedValue({ id: 1 });

    (Spesa.create as jest.Mock).mockResolvedValue(newSpesa);

    const response = await request(app)
      .post(`${__BASE_PATH__}/spese`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send(newSpesa);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(newSpesa);
  });

  // Test per gestire errori durante la creazione di una spese
  it(`POST ${__BASE_PATH__}/spese - Errore durante la creazione della spese`, async () => {
    const newSpesa = {
      descrizione: "Nuova Spesa",
      importo: 150,
      tipoId: 1,
      guadagno_spese: false,
      tipo_importo: "uscita",
    };

    const mockUser = { id: 1 };
    (Utente.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (Tipo.findByPk as jest.Mock).mockResolvedValue({ id: 1 });

    (Spesa.create as jest.Mock).mockImplementation(() => {
      throw new Error("Errore del server"); // Simula un errore del server
    });

    const response = await request(app)
      .post(`${__BASE_PATH__}/spese`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send(newSpesa);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Errore durante la creazione della spesa",
    });
  });

  // Test per aggiornare una spese
  it(`PUT ${__BASE_PATH__}/spese/:id - Modifica una spese`, async () => {
    const updatedSpesa = {
      descrizione: "Spesa Aggiornata",
      importo: 200,
      tipoId: 1,
      tipo_importo: "uscita",
    };

    (Spesa.findByPk as jest.Mock).mockResolvedValue({
      update: jest.fn().mockResolvedValue(updatedSpesa),
    });

    const response = await request(app)
      .put(`${__BASE_PATH__}/spese/1`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send(updatedSpesa);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedSpesa);
  });

  // Test per eliminare una spese
  it(`DELETE ${__BASE_PATH__}/spese/:id - Elimina una spese`, async () => {
    (Spesa.findByPk as jest.Mock).mockResolvedValue({
      destroy: jest.fn(),
    });

    const response = await request(app)
      .delete(`${__BASE_PATH__}/spese/1`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Spesa eliminata' });
  });

  // Test per gestire errori durante l'aggiornamento di una spese
  it(`PUT ${__BASE_PATH__}/spese/:id - Errore durante l'aggiornamento della spese`, async () => {
    (Spesa.findByPk as jest.Mock).mockResolvedValue(null); // Simula che la spese non esista

    const response = await request(app)
      .put(`${__BASE_PATH__}/spese/1`)
      .set("Authorization", `Bearer ${mockToken}`)
      .send({});

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Spesa non trovata' });
  });

  // Test per gestire errori durante l'eliminazione di una spese
  it(`DELETE ${__BASE_PATH__}/spese/:id - Errore durante l'eliminazione della spese`, async () => {
    (Spesa.findByPk as jest.Mock).mockResolvedValue({
      destroy: jest.fn().mockImplementation(() => {
        throw new Error("Errore del server"); // Simula un errore del server
      }),
    });

    const response = await request(app)
      .delete(`${__BASE_PATH__}/spese/1`)
      .set("Authorization", `Bearer ${mockToken}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Errore del server' });
  });
});
