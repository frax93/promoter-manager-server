import crypto from 'crypto';

export function generateConfirmationToken() {
  return crypto.randomBytes(20).toString('hex'); // Crea un codice casuale esadecimale
}
