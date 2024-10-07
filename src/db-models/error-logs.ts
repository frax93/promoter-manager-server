import { DataTypes } from "sequelize";
import { Utente } from "./user"; // Importa il modello User per la foreign key
import sequelize from "../utils/sequelize";

const ErrorLog = sequelize.define(
  "ErrorLog",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stack_trace: {
      type: DataTypes.TEXT,
    },
    app_context: {
      type: DataTypes.JSONB, // In Postgres, JSONB è rappresentato con DataTypes.JSONB
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Utente, // Fa riferimento al modello User
        key: "id",
      },
      onDelete: "SET NULL", // Se l'utente viene eliminato, imposta user_id a NULL
    },
    user_agent: {
      type: DataTypes.TEXT,
    },
    platform: {
      type: DataTypes.STRING(50),
    },
    app_version: {
      type: DataTypes.STRING(20),
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    severity_level: {
      type: DataTypes.STRING(10),
      defaultValue: "error",
    },
  },
  {
    tableName: "error_logs",
  }
);


ErrorLog.belongsTo(Utente, { foreignKey: "user_id", as: "utente" });

export { ErrorLog };

