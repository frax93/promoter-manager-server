import { NextFunction, Request, Response, Router } from "express";
import { Tipo } from "../db-models/type";
import jwtMiddleware from "../middleware/jwt";

const router = Router();

router.use(jwtMiddleware());

// API per recuperare tutti i tipi
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tipi = await Tipo.findAll();
    res.json(tipi);
  } catch (err) {
    next(err);
  }
});

export default router;
