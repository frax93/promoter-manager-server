import { generateConfirmationToken } from "./generate-confirmation-token";

describe('generateConfirmationToken', () => {
  it('dovrebbe generare un token lungo 40 caratteri', () => {
    const token = generateConfirmationToken();
    expect(token).toHaveLength(40); // Ogni byte produce 2 caratteri esadecimali, quindi 20 * 2 = 40
  });

  it('dovrebbe generare un token in formato esadecimale', () => {
    const token = generateConfirmationToken();
    const hexRegex = /^[0-9a-fA-F]+$/; // Regex per i caratteri esadecimali
    expect(token).toMatch(hexRegex); // Verifica che il token sia in formato esadecimale
  });

  it('dovrebbe generare token unici per chiamate consecutive', () => {
    const token1 = generateConfirmationToken();
    const token2 = generateConfirmationToken();
    expect(token1).not.toBe(token2); // I due token generati dovrebbero essere diversi
  });
});
