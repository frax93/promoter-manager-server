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
  },
  {
    tableName: "note",
  }
);

export { Note };

