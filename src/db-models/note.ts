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
    }
  },
  {
    tableName: "note",
  }
);

export { Note };

