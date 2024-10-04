import { ValidationErrorItem } from "joi";
import { StatusCode } from "../constants/status-code";

export class GenericError {
    code?: StatusCode;
    message?: string;
    errors?: Partial<ValidationErrorItem>[];
    stack?: string;
    constructor(code: StatusCode, message: string) {
      this.code = code;
      this.message = message;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
