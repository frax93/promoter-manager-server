import { NextFunction, Request, Response, Router } from "express";
import jwtMiddleware from "../middleware/jwt";
import { Priority } from "../db-models/priority";
import { PriorityModel } from "../models/priority";
import { Model } from "sequelize";
import { StatusCode } from "../constants/status-code";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const priorities: Model<PriorityModel>[] = await Priority.findAll(); // Recupera tutte le priorità
    res.status(StatusCode.Ok).json(priorities); // Invia le priorità come risposta JSON
  } catch (error) {
    next(error);
  }
});

export default router;
