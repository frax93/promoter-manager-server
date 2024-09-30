import { Request, Response, Router } from "express";
import jwtMiddleware from "../middleware/jwt";
import { Priority } from "../db-models/priority";
import { PriorityModel } from "../models/priority";
import { Model } from "sequelize";

const router = Router();

router.use(jwtMiddleware());

router.get("/", async (req: Request, res: Response) => {
  try {
    const priorities: Model<PriorityModel>[] = await Priority.findAll(); // Recupera tutte le priorità
    res.json(priorities); // Invia le priorità come risposta JSON
  } catch (error) {
    console.error("Errore durante il recupero delle priorità:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
});

export default router;
