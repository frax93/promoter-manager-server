import { Model } from "sequelize";
import { UserModel } from "./user";

export interface TeamModel {
  id: number;
  utenti: Array<Model<UserModel>>;
}
