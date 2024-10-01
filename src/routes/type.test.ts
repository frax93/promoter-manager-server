import request from 'supertest'; // Per simulare richieste HTTP
import { app } from '../'; // Importa la tua applicazione Express
import { Tipo } from '../db-models/type'; // Importa il modello mockato
import { __BASE_PATH__ } from '../constants/environment'; // Importa il valore di __BASE_PATH__
import { mockToken } from '../mocks/jest-logged-user'; // Importa il mock del token

describe('Test API Tipi', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Ripulisci i mock prima di ogni test
  });

  it(`GET ${__BASE_PATH__}/tipi - Recupera tutti i tipi con successo`, async () => {
    // Mock dei dati da restituire dal modello Sequelize
    const mockTipi = [
      { id: 1, nome: 'Tipo A' },
      { id: 2, nome: 'Tipo B' },
    ];

    // Mock della funzione `findAll` di Sequelize
    (Tipo.findAll as jest.Mock).mockResolvedValue(mockTipi);

    // Effettua la richiesta al server mockato, includendo __BASE_PATH__ nell'URL
    const response = await request(app)
      .get(`${__BASE_PATH__}/tipi`)
      .set('Authorization', `Bearer ${mockToken}`);

    // Verifica che lo stato della risposta sia 200
    expect(response.status).toBe(200);

    // Verifica che il body della risposta sia uguale ai dati mockati
    expect(response.body).toEqual(mockTipi);

    // Verifica che il metodo `findAll` sia stato chiamato una volta
    expect(Tipo.findAll).toHaveBeenCalledTimes(1);
  });

  it(`GET ${__BASE_PATH__}/tipi - Errore nel recupero dei tipi`, async () => {
    // Mock per simulare un errore
    (Tipo.findAll as jest.Mock).mockRejectedValue(new Error('Errore nel database'));

    // Effettua la richiesta al server mockato, includendo __BASE_PATH__ nell'URL
    const response = await request(app)
      .get(`${__BASE_PATH__}/tipi`)
      .set('Authorization', `Bearer ${mockToken}`);

    // Verifica che lo stato della risposta sia 500
    expect(response.status).toBe(500);

    // Verifica che il messaggio di errore sia restituito correttamente
    expect(response.text).toBe("Errore nel recupero dei tipi");

    // Verifica che il metodo `findAll` sia stato chiamato una volta
    expect(Tipo.findAll).toHaveBeenCalledTimes(1);
  });
});
