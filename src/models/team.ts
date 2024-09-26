import { Model } from "sequelize";
import { UserModel } from "./user";
import { DateTime } from "luxon";

export interface TeamModel {
  id?: number;
  nome: string;
  descrizione: string;
  colore: string;
  is_cliente: boolean;
  attivo?: boolean;
  data_disattivo?: DateTime | null;
  utenti?: Array<Model<UserModel>>;
}
