import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";

const Tipo = sequelize.define('Tipo', {
    nome: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    descrizione: {
        type: DataTypes.TEXT,
    },
}, {
    tableName: 'tipo'
});

export { Tipo };