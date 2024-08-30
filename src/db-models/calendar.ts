import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Evento } from "./event";

const Calendario = sequelize.define(
  "Calendario",
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descrizione: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "calendario",
  }
);

  


export { Calendario };