import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Utente } from '../db-models/user';
import { __JWT_SECRET__ } from '../constants/environment';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const utente = await Utente.findOne({ where: { email } });
        if (!utente) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        const passwordIsValid = await bcrypt.compare(password, utente.dataValues.password);

        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Password errata' });
        }

        const token = jwt.sign(
          { id: utente.dataValues.id, email: utente.dataValues.email },
          __JWT_SECRET__,
          {
            expiresIn: 86400, // 24 ore
          }
        );

        res.status(200).json({
            id: utente.dataValues.id,
            email: utente.dataValues.email,
            accessToken: token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Errore nel login' });
    }
});

// API per creare un nuovo utente
router.post('/registrazione', async (req, res) => {
    const { nome, email, password } = req.body;
    try {
        const utente = await Utente.create({ nome, email, password });
        res.status(201).json(utente);
    } catch (err) {
        console.error(err);
        res.status(500).send('Errore nella creazione dell\'utente');
    }
});

export default router;