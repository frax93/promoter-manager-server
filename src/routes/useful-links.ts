import { Router } from "express";
import jwtMiddleware from "../middleware/jwt";
import { LinkUtili } from "../db-models/useful-links";

const router = Router();

router.use(jwtMiddleware());

// API per recuperare i link di un utente
router.get("/utente", async (req, res) => {
  const idUtente = req.user?.id;
  try {
    const links = await LinkUtili.findAll({
      where: { utente_id: idUtente },
    });
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore nel recupero dei link");
  }
});

router.put("/", async (req, res) => {
  const { links } = req.body; // links è un array di oggetti { id, url }
  const userId = req.user?.id;

  if (!Array.isArray(links)) {
    return res.status(400).json({ message: "Richiesta non valida" });
  }

  try {
    // Aggiorna i link esistenti
    for (const link of links) {
      if (link.id) {
        await LinkUtili.update({ url: link.url }, { where: { id: link.id } });
      } else {
        // Crea un nuovo link
        await LinkUtili.create({ url: link.url, userId });
      }
    }

    return res.status(200).json({ message: "Link aggiornati con successo" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Errore del server" });
  }
});

export default router;
