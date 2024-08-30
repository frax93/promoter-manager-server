import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Evento } from "./event";
import { Tipo } from "./type";
import { Utente } from "./user";

const Spesa = sequelize.define(
  "Spesa",
  {
    importo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    descrizione: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "spese",
  }
);

Spesa.belongsTo(Evento, { foreignKey: 'evento_id', as: 'eventoId' });
Spesa.belongsTo(Tipo, { foreignKey: 'tipo_id', as: 'tipoId' });
Spesa.belongsTo(Utente, { foreignKey: 'utente_id', as: 'utenteId' });

export { Spesa };

