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
