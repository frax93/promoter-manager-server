import express from 'express';
import bodyParser from 'body-parser';
import expensesRouter from './routes/expense';
import teamRouter from './routes/team';
import userRouter from './routes/users';
import authRouter from './routes/auth';
import calendarRouter from './routes/calendar';
import eventRouter from './routes/event';
import noteRouter from './routes/note';
import typeRouter from './routes/type';
import cors from 'cors';
import sequelize from './utils/sequelize';
import { __BASE_PATH__, __ORIGIN__, __PORT__ } from './constants/environment';
import admin from 'firebase-admin';
import cron from 'node-cron';

// Inizializza l'app Firebase Admin
const serviceAccount = require('./promoter-manager-35bdc-firebase-adminsdk-dprjc-50c6eb4744.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();


// Middleware
app.use(cors({
    origin: __ORIGIN__,
    credentials: true,
}));

app.use(bodyParser.json());

const testDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connessione al database stabilita con successo.');
    } catch (error) {
        console.error('Impossibile connettersi al database:', error);
        process.exit(1); // Esci con un codice di errore
    }
};

testDatabaseConnection();

// Pianifica l'invio di notifiche
cron.schedule('* * * * *', async () => { // Esempio: ogni minuto
    console.log('Controllo se ci sono notifiche da inviare...');
  
    // Implementa la logica per recuperare i token e i dettagli della notifica dal database
    // Esempio:
    const notifications = [
      {
        token: 'esempio_token',
        title: 'Promemoria',
        body: 'Questa è una notifica programmata.',
      }
    ];
  
    for (const notification of notifications) {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        token: notification.token,
      };
  
      try {
        const response = await admin.messaging().send(message);
        console.log('Notifica inviata con successo:', response);
      } catch (error) {
        console.error('Errore durante l\'invio della notifica:', error);
      }
    }
  });

// Routes
app.use(`${__BASE_PATH__}/spese`, expensesRouter);
app.use(`${__BASE_PATH__}/autenticazione`, authRouter);
app.use(`${__BASE_PATH__}/team`, teamRouter);
app.use(`${__BASE_PATH__}/utenti`, userRouter);
app.use(`${__BASE_PATH__}/calendari`, calendarRouter);
app.use(`${__BASE_PATH__}/eventi`, eventRouter);
app.use(`${__BASE_PATH__}/note`, noteRouter);
app.use(`${__BASE_PATH__}/tipi`, typeRouter);

app.listen(__PORT__, () => {
  console.log(`Server running at http://localhost:${__PORT__}`);
});
