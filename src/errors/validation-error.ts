import { ValidationErrorItem } from "joi";
import { GenericError } from "./generic-error";
import { StatusCode } from "../constants/status-code";

export class ValidationError extends GenericError {
  errors: Partial<ValidationErrorItem>[];
  constructor(errors: Partial<ValidationErrorItem>[], message?: string) {
    super(StatusCode.BadRequest, message || "Validation Error");
    this.errors = errors;
  }
}
