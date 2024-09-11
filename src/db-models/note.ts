import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";

const Note = sequelize.define(
  "Note",
  {
    contenuto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data_creazione: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reminder_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true, // Token del dispositivo per notifiche
    },
  },
  {
    tableName: "note",
  }
);

export { Note };

