import { Model } from "sequelize";
import { EventoModel } from "./event";

export interface CalendarModel {
  id: number;
  eventi: Array<Model<EventoModel>>;
}