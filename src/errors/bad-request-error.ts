import { StatusCode } from "../constants/status-code";
import { GenericError } from "./generic-error";

export class BadRequestError extends GenericError {
  constructor(message: string) {
    super(StatusCode.BadRequest, message);
  }
}
