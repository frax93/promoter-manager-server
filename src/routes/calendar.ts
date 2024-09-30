import { Calendario } from "../db-models/calendar";
import { Evento } from "../db-models/event";
import { Request, Response, Router } from "express";
import jwtMiddleware from "../middleware/jwt";

const router = Router();

router.use(jwtMiddleware());

// API per recuperare tutti i calendari
router.get("/", async (req: Request, res: Response) => {
  try {
    const calendari = await Calendario.findAll();
    res.json(calendari);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero dei calendari");
  }
});

// API per recuperare gli eventi associati a un calendario
router.get("/:id/eventi", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const calendario = await Calendario.findByPk(id, {
      include: { model: Evento, as: "eventi" },
    });
    if (!calendario) {
      return res.status(404).send("Nessun evento trovato per il calendario");
    }
    res.json(calendario);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero degli eventi");
  }
});

export default router;
