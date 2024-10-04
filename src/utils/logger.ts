import winston from "winston";

// Configurazione del logger con winston
export const logger = winston.createLogger({
  level: "info", // Livello di logging
  format: winston.format.combine(
    winston.format.timestamp(), // Aggiunge un timestamp
    winston.format.json() // Log in formato JSON
  ),
  transports: [
    new winston.transports.Console(), // Log sulla console
    new winston.transports.File({ filename: "error.log", level: "error" }), // Log degli errori in un file
    new winston.transports.File({ filename: "combined.log" }), // Log combinati
  ],
});
