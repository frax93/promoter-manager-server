import request from 'supertest'; // Per simulare richieste HTTP
import { app } from '../'; // Importa la tua applicazione Express
import { LinkUtili } from '../db-models/useful-links'; // Importa il modello mockato
import { __BASE_PATH__ } from '../constants/environment'; // Importa il valore di __BASE_PATH__
import { mockToken } from '../mocks/jest-logged-user'; // Importa il mock del token

describe('Test API Link Utili', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Ripulisci i mock prima di ogni test
  });

  it(`GET ${__BASE_PATH__}/link-utili/utente - Recupera tutti i link di un utente con successo`, async () => {
    // Mock dei dati da restituire dal modello Sequelize
    const mockLinks = [
      { id: 1, url: 'http://example.com', descrizione: 'Link 1', utente_id: 1 },
      { id: 2, url: 'http://example2.com', descrizione: 'Link 2', utente_id: 1 },
    ];

    // Mock della funzione `findAll` di Sequelize
    (LinkUtili.findAll as jest.Mock).mockResolvedValue(mockLinks);

    // Effettua la richiesta al server mockato, includendo __BASE_PATH__ nell'URL
    const response = await request(app)
      .get(`${__BASE_PATH__}/link-utili/utente`)
      .set('Authorization', `Bearer ${mockToken}`);

    // Verifica che lo stato della risposta sia 200
    expect(response.status).toBe(200);

    // Verifica che il body della risposta sia uguale ai dati mockati
    expect(response.body).toEqual(mockLinks);

    // Verifica che il metodo `findAll` sia stato chiamato una volta
    expect(LinkUtili.findAll).toHaveBeenCalledTimes(1);
  });

  it(`GET ${__BASE_PATH__}/link-utili/utente - Errore nel recupero dei link`, async () => {
    // Mock per simulare un errore
    (LinkUtili.findAll as jest.Mock).mockRejectedValue(new Error('Errore nel database'));

    // Effettua la richiesta al server mockato, includendo __BASE_PATH__ nell'URL
    const response = await request(app)
      .get(`${__BASE_PATH__}/link-utili/utente`)
      .set('Authorization', `Bearer ${mockToken}`);

    // Verifica che lo stato della risposta sia 500
    expect(response.status).toBe(500);

    // Verifica che il messaggio di errore sia restituito correttamente
    expect(response.text).toBe("Errore nel recupero dei link");

    // Verifica che il metodo `findAll` sia stato chiamato una volta
    expect(LinkUtili.findAll).toHaveBeenCalledTimes(1);
  });

  it(`PUT ${__BASE_PATH__}/link-utili - Aggiorna i link dell'utente con successo`, async () => {
    // Mock dei link esistenti e dei link inviati dal client
    const existingLinks = [
      {
        dataValues: {
          id: 1,
          url: "http://example.com",
          descrizione: "Link 1",
          utente_id: 1,
        },
      },
    ];

    const newLinks = [
      { id: 1, url: 'http://example.com/updated', descrizione: 'Link 1 Updated', utente_id: 1 },
      { url: 'http://example3.com', descrizione: 'Link 3' },
    ];

    // Mock della funzione `findAll` per i link esistenti
    (LinkUtili.findAll as jest.Mock).mockResolvedValue(existingLinks);

    // Mock per `update` e `create`
    (LinkUtili.update as jest.Mock).mockResolvedValue([{ url: 'http://example3.com', descrizione: 'Link 3' }]); // Simula un aggiornamento riuscito
    (LinkUtili.create as jest.Mock).mockResolvedValue({ id: 3, url: 'http://example3.com', descrizione: 'Link 3' });

    // Effettua la richiesta al server mockato, includendo __BASE_PATH__ nell'URL
    const response = await request(app)
      .put(`${__BASE_PATH__}/link-utili`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ links: newLinks });

    // Verifica che lo stato della risposta sia 200
    expect(response.status).toBe(200);

    // Verifica che il messaggio di successo sia restituito correttamente
    expect(response.body).toEqual({ message: "Link aggiornati con successo" });

    // Verifica che `findAll` sia stato chiamato una volta
    expect(LinkUtili.findAll).toHaveBeenCalledTimes(1);

    // Verifica che `update` e `create` siano stati chiamati correttamente
    expect(LinkUtili.update).toHaveBeenCalledWith(
      { url: 'http://example.com/updated', descrizione: 'Link 1 Updated' },
      { where: { id: 1 } }
    );
    expect(LinkUtili.create).toHaveBeenCalledWith({
      url: 'http://example3.com',
      descrizione: 'Link 3',
      utente_id: 1,
    });
  });

  it(`PUT ${__BASE_PATH__}/link-utili - Errore nel formato dei link inviati`, async () => {
    // Effettua la richiesta al server con un formato non valido per `links`
    const response = await request(app)
      .put(`${__BASE_PATH__}/link-utili`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ links: "non un array valido" }); // Passiamo un valore errato

    // Verifica che lo stato della risposta sia 400
    expect(response.status).toBe(400);

    // Verifica che il messaggio di errore sia restituito correttamente
    expect(response.body).toEqual({ message: "Richiesta non valida" });
  });

  it(`PUT ${__BASE_PATH__}/link-utili - Errore durante l'aggiornamento dei link`, async () => {
    // Mock per simulare un errore durante il recupero dei link
    (LinkUtili.findAll as jest.Mock).mockRejectedValue(new Error('Errore nel database'));

    const validLinks = [
      { id: 1, url: 'http://example.com/updated', descrizione: 'Link 1 Updated' },
    ];

    // Effettua la richiesta al server mockato, includendo __BASE_PATH__ nell'URL
    const response = await request(app)
      .put(`${__BASE_PATH__}/link-utili`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ links: validLinks });

    // Verifica che lo stato della risposta sia 500
    expect(response.status).toBe(500);

    // Verifica che il messaggio di errore sia restituito correttamente
    expect(response.body).toEqual({ message: "Errore del server" });

    // Verifica che `findAll` sia stato chiamato una volta
    expect(LinkUtili.findAll).toHaveBeenCalledTimes(1);
  });
});
