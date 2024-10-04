import { StatusCode } from "../constants/status-code";
import { GenericError } from "./generic-error";

export class NotFoundError extends GenericError {
  constructor(message: string) {
    super(StatusCode.NotFound, message);
  }
}
