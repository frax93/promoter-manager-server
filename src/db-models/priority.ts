import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";

const Priority = sequelize.define(
  "Priority",
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "priorita",
  }
);


export { Priority };