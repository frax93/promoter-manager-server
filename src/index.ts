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
import usefulLinksRouter from './routes/useful-links';
import priorityRouter from './routes/priority';
import cors from 'cors';
import sequelize from './utils/sequelize';
import { __BASE_PATH__, __ORIGIN__, __PORT__ } from './constants/environment';
import cron from 'node-cron';
import { checkAndSendNoteReminders } from './utils/send-push';
import { webAppUrl } from './utils/send-email';
import { logger } from './utils/logger';
import { requestInterceptor } from './middleware/request-interceptor';
import { errorInterceptor } from './middleware/error-interceptor';

export const app = express();

const allowedOrigins = [__ORIGIN__, webAppUrl];

// Middleware
app.use(cors({
    origin: function (origin, callback) {
      // Permetti le richieste senza origine (ad esempio, richieste da Postman)
      if (!origin) return callback(null, true);
  
      // Controlla se l'origine è nell'array delle origini consentite
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        // Se l'origine non è consentita, restituisci un errore
        return callback(new Error('Non consentito dall\'origine CORS'));
      }
    },
    credentials: true,
}));

app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'test') {
  cron.schedule('* * * * *', async () => {
    logger.info('Checking for note reminders to send...');
    await checkAndSendNoteReminders();
  });
}

const testDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connessione al database stabilita con successo.');
    } catch (error) {
        logger.error('Impossibile connettersi al database:', error);
        process.exit(1); // Esci con un codice di errore
    }
};

testDatabaseConnection();


app.use(requestInterceptor);


// Routes
app.use(`${__BASE_PATH__}/spese`, expensesRouter);
app.use(`${__BASE_PATH__}/autenticazione`, authRouter);
app.use(`${__BASE_PATH__}/team`, teamRouter);
app.use(`${__BASE_PATH__}/utenti`, userRouter);
app.use(`${__BASE_PATH__}/calendari`, calendarRouter);
app.use(`${__BASE_PATH__}/eventi`, eventRouter);
app.use(`${__BASE_PATH__}/note`, noteRouter);
app.use(`${__BASE_PATH__}/tipi`, typeRouter);
app.use(`${__BASE_PATH__}/link-utili`, usefulLinksRouter);
app.use(`${__BASE_PATH__}/priorita`, priorityRouter);

app.use(errorInterceptor);

if (process.env.NODE_ENV !== 'test') {
  app.listen(__PORT__, () => {
    logger.info(`Server running at http://localhost:${__PORT__}`);
  });
}
