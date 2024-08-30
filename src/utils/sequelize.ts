import { Sequelize } from "sequelize";
import { __DATABASE_SCHEMA__, __DATABASE_URL__ } from "../constants/environment";

const sequelize = new Sequelize(__DATABASE_URL__, {
  dialect: "postgres",
  define: {
    schema: __DATABASE_SCHEMA__,
    timestamps: false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
  }
});

export default sequelize;

