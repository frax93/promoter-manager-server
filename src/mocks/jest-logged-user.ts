import jwt from "jsonwebtoken";
import { __JWT_SECRET__ } from "../constants/environment";

// Utente mock per il test
export const mockUser = {
  id: 1,
  nome: "Utente Test",
  email: "test@example.com",
};

// Genera il token JWT mock
export const mockToken = jwt.sign(
  { id: mockUser.id, email: mockUser.email, name: mockUser.nome },
  __JWT_SECRET__
);
