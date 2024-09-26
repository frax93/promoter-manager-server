import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Utente } from "./user";

const LinkUtili = sequelize.define(
  "LinkUtili",
  {
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descrizione: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    utente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "utenti", // Nome della tabella a cui fa riferimento
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "link_utili", // Nome della tabella
    timestamps: false, // Se non hai campi createdAt/updatedAt
  }
);

Utente.hasMany(LinkUtili, {
  foreignKey: "utente_id",
  as: "linkUtili", // Alias per accedere ai link utili di un utente
});

LinkUtili.belongsTo(Utente, {
  foreignKey: "utente_id",
  as: "utente", // Alias per accedere all'utente associato
});

export { LinkUtili };