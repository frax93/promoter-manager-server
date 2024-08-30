import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Note } from "./note";
import { UtenteTeam } from "./user-team";
import { Team } from "./team";
import bcrypt from 'bcryptjs';

const Utente = sequelize.define('Utente', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    data_creazione: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    google_id: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'utenti',
    hooks: {
        beforeCreate: async (utente) => {
            if (utente.dataValues.password) {
                const salt = await bcrypt.genSalt(10);
                utente.dataValues.password = await bcrypt.hash(utente.dataValues.password, salt);
            }
        },
    },
});

Utente.hasMany(Note, { foreignKey: 'utente_id', as: 'note' });
  
export { Utente };