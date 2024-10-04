import { NextFunction, Request, Response, Router } from "express";
import jwtMiddleware from "../middleware/jwt";
import { LinkUtili } from "../db-models/useful-links";
import { UsefulLinkModel } from "../models/useful-links";
import { Model } from "sequelize";
import { PromoterManagerRequestBody } from "../types/request";
import { CreateUsefulLinkBody } from "../types/useful-links";
import { validateRequest } from "../middleware/validate-schema";
import { createUsefulLinkSchema } from "../schema/useful-links";
import { BadRequestError } from "../errors/bad-request-error";

const router = Router();

router.use(jwtMiddleware());

// API per recuperare i link di un utente
router.get("/utente", async (req: Request, res: Response, next: NextFunction) => {
  const idUtente = req.user?.id;
  try {
    const links = await LinkUtili.findAll({
      where: { utente_id: idUtente },
    });
    res.json(links);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/",
  validateRequest(createUsefulLinkSchema),
  async (
    req: PromoterManagerRequestBody<CreateUsefulLinkBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { links } = req.body; // links è un array di oggetti { id, url }
    const userId = req.user?.id;

    try {
      if (!Array.isArray(links)) {
        throw new BadRequestError("Richiesta non valida");
      }
  
      // Recupera i link esistenti per l'utente
      const existingLinks: Model<UsefulLinkModel>[] | null =
        await LinkUtili.findAll({
          where: { utente_id: userId },
        });

      // Crea un set di id dei link esistenti per facilitarne la ricerca
      const existingLinkIds = new Set(
        existingLinks.map((link) => link.dataValues.id)
      );

      // Aggiorna o crea i link
      for (const link of links) {
        if (link.id) {
          // Se il link esiste già, lo aggiorniamo
          await LinkUtili.update(
            { url: link.url, descrizione: link.descrizione },
            { where: { id: link.id } }
          );
          existingLinkIds.delete(link.id); // Rimuovi l'id dal set
        } else {
          // Crea un nuovo link
          await LinkUtili.create({
            url: link.url,
            descrizione: link.descrizione,
            utente_id: userId,
          });
        }
      }

      // Rimuovi i link che non sono più presenti in links
      if (existingLinkIds.size > 0) {
        await LinkUtili.destroy({
          where: { id: Array.from(existingLinkIds) },
        });
      }

      return res.status(200).json({ message: "Link aggiornati con successo" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
