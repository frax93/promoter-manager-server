import request from 'supertest'; // Per simulare richieste HTTP
import { app } from '../'; // Importa la tua applicazione Express
import { Priority } from '../db-models/priority'; // Importa il modello mockato
import { __BASE_PATH__ } from '../constants/environment'; // Importa il valore di __BASE_PATH__
import { mockToken } from '../mocks/jest-logged-user';

describe('Test API Priorità', () => {
  it(`GET ${__BASE_PATH__}/priorita - Recupera tutte le priorità con successo`, async () => {
    // Mock dei dati da restituire dal modello Sequelize
    const mockPriorities = [
      { id: 1, nome: 'Alta', descrizione: 'Alta priorità' },
      { id: 2, nome: 'Media', descrizione: 'Media priorità' },
    ];

    // Mock della funzione `findAll` di Sequelize
    (Priority.findAll as jest.Mock).mockResolvedValue(mockPriorities);

    // Effettua la richiesta al server mockato, includendo __BASE_PATH__ nell'URL
    const response = await request(app)
      .get(`${__BASE_PATH__}/priorita`)
      .set("Authorization", `Bearer ${mockToken}`);

    // Verifica che lo stato della risposta sia 200
    expect(response.status).toBe(200);

    // Verifica che il body della risposta sia uguale ai dati mockati
    expect(response.body).toEqual(mockPriorities);

    // Verifica che il metodo `findAll` sia stato chiamato una volta
    expect(Priority.findAll).toHaveBeenCalledTimes(1);
  });

  it(`GET ${__BASE_PATH__}/priorita - Errore nel recupero delle priorità`, async () => {
    // Mock per simulare un errore
    (Priority.findAll as jest.Mock).mockRejectedValue(new Error('Errore nel database'));

    // Effettua la richiesta al server mockato, includendo __BASE_PATH__ nell'URL
    const response = await request(app)
      .get(`${__BASE_PATH__}/priorita`)
      .set("Authorization", `Bearer ${mockToken}`);

    // Verifica che lo stato della risposta sia 500
    expect(response.status).toBe(500);

    // Verifica che il messaggio di errore sia restituito correttamente
    expect(response.body).toEqual({ message: 'Errore interno del server' });

    // Verifica che il metodo `findAll` sia stato chiamato una volta
    expect(Priority.findAll).toHaveBeenCalledTimes(1);
  });
});
