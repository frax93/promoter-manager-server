import { Router } from "express";
import { Tipo } from "../db-models/type";
import jwtMiddleware from "../middleware/jwt";

const router = Router();

router.use(jwtMiddleware());

// API per recuperare tutti i tipi
router.get("/", async (req, res) => {
  try {
    const tipi = await Tipo.findAll();
    res.json(tipi);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero dei tipi");
  }
});

export default router;
