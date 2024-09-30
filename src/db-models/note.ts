import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Priority } from "./priority";

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
    priority_id: {
      // Definisci la chiave esterna per la priorità
      type: DataTypes.INTEGER,
      allowNull: true, // Può essere null per rappresentare la relazione 0 o 1
      references: {
        model: Priority,
        key: "id", // Colonna di riferimento nel modello Priority
      },
    },
  },
  {
    tableName: "note",
  }
);

Note.hasOne(Priority, {
  foreignKey: "priority_id",
  as: "priority",
});


export { Note };

