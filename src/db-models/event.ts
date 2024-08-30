import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Team } from "./team";
import { Calendario } from "./calendar";

const Evento = sequelize.define(
  "Evento",
  {
    titolo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descrizione: {
      type: DataTypes.TEXT,
    },
    data_inizio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    data_fine: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    calendario_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Calendario, // Nome della tabella nel database
        key: "id",
      },
    },
  },
  {
    tableName: "eventi",
  }
);

Evento.belongsTo(Team, { foreignKey: 'team_id', as: 'teamId' });

Calendario.hasMany(Evento, {
    foreignKey: 'calendario_id',
    as: 'eventi',
  });
  
  Evento.belongsTo(Calendario, {
    foreignKey: 'calendario_id',
    as: 'calendario',
  });


export { Evento };