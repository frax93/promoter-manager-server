import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Calendario } from "./calendar";

const Team = sequelize.define(
  "Team",
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descrizione: {
      type: DataTypes.TEXT,
    },
    colore: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attivo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    data_disattivo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "team",
  }
);

Team.hasOne(Calendario, {
  foreignKey: "team_id",
  as: "calendario",
});


export { Team };