import { Router } from "express";
import jwtMiddleware from "../middleware/jwt";
import { LinkUtili } from "../db-models/useful-links";

const router = Router();

router.use(jwtMiddleware());

// API per recuperare i link di un utente
router.get("/utente", async (req, res) => {
  const idUtente = req.user?.id;
  try {
    const note = await LinkUtili.findAll({
      where: { utente_id: idUtente },
    });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero dei link");
  }
});

export default router;
