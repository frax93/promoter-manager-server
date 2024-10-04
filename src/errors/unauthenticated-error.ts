import { StatusCode } from "../constants/status-code";
import { GenericError } from "./generic-error";

export class UnauthanteticatedError extends GenericError {
  constructor(message: string) {
    super(StatusCode.Unauthenticated, message);
  }
}
