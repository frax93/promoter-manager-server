import express, { NextFunction, Response } from "express";
import { __JWT_SECRET__ } from "../constants/environment";
import { ErrorLog } from "../db-models/error-logs";
import { StatusCode } from "../constants/status-code";
import { PromoterManagerRequestBody } from "../types/request";
import { ErrorLogRequestBody } from "../types/error-logs";
import { validateRequest } from "../middleware/validate-schema";
import { errorLogSchema } from "../schema/error-logs";

const router = express.Router();

// Applicazione del middleware JWT
router.post(
  "/",
  validateRequest(errorLogSchema),
  async (
    req: PromoterManagerRequestBody<ErrorLogRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      error_message,
      stack_trace,
      app_context,
      user_agent,
      platform,
      app_version,
      severity_level,
      user_id,
    } = req.body;

    try {
      const newErrorLog = await ErrorLog.create({
        error_message,
        stack_trace,
        app_context,
        user_id,
        user_agent,
        platform,
        app_version,
        severity_level,
      });

      return res.status(StatusCode.Ok).json({
        message: "Log di errore creato con successo",
        data: newErrorLog,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
