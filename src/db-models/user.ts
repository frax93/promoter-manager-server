import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Note } from "./note";
import bcrypt from 'bcryptjs';

const Utente = sequelize.define(
  "Utente",
  {
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
    two_factor_secret: {
      type: DataTypes.STRING(64), // Campo per il segreto 2FA
      allowNull: true,
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN, // Booleano per abilitare/disabilitare la 2FA
      defaultValue: false,
    },
    referrallink: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    linkvideo: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    linkazienda: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    token_verifica: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scadenza_token: {
      type: DataTypes.DATE, // Campo per memorizzare la data di scadenza del token
      allowNull: true,
    },
    email_confermata: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "utenti",
    hooks: {
      beforeCreate: async (utente) => {
        if (utente.dataValues.password) {
          const salt = await bcrypt.genSalt(10);
          utente.dataValues.password = await bcrypt.hash(
            utente.dataValues.password,
            salt
          );
        }
      },
    },
  }
);

Utente.hasMany(Note, { foreignKey: 'utente_id', as: 'note' });
  
export { Utente };