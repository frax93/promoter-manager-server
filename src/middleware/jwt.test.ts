import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { __JWT_SECRET__ } from "../constants/environment";
import { JwtUser } from "../models/jwt-user";
import jwtMiddleware from "./jwt";

describe("jwtMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("dovrebbe ritornare 401 se il token non è presente", () => {
    mockRequest = {
      headers: {
        authorization: "",
      },
    };

    jwtMiddleware()(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Accesso negato. Token non fornito.",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("dovrebbe ritornare 401 se il token non è valido", () => {
    mockRequest = {
      headers: {
        authorization: "Bearer invalid_token",
      },
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Token non valido");
    });

    jwtMiddleware()(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Token non valido.",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("dovrebbe chiamare next() se il token è valido", () => {
    const mockDecoded: JwtUser = {
      id: "1",
      email: "utente@example.com",
      name: "Utente",
    };

    mockRequest = {
      headers: {
        authorization: "Bearer valid_token",
      },
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

    jwtMiddleware()(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.user).toEqual(mockDecoded); // Verifica che i dati dell'utente siano impostati nella richiesta
    expect(nextFunction).toHaveBeenCalled(); // Verifica che next() sia stato chiamato
    expect(mockResponse.status).not.toHaveBeenCalled(); // Non dovrebbero esserci errori
  });
});
