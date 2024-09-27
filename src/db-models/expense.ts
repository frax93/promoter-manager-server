import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
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
    guadagno_spesa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "spese",
  }
);

Spesa.belongsTo(Tipo, { foreignKey: 'tipo_id', as: 'tipoId' });
Spesa.belongsTo(Utente, { foreignKey: 'utente_id', as: 'utenteId' });

export { Spesa };

