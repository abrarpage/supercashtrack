import { PUBLIC_ID_LENGTH, PUBLIC_ID_PREFIX } from "./constants";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa I,O,1,0 yang ambigu

export function generatePublicId(): string {
  const chars = new Array(PUBLIC_ID_LENGTH);
  for (let i = 0; i < PUBLIC_ID_LENGTH; i++) {
    chars[i] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return PUBLIC_ID_PREFIX + chars.join("");
}

export function isValidPublicIdFormat(input: string): boolean {
  return new RegExp(`^${PUBLIC_ID_PREFIX}[${ALPHABET}]{${PUBLIC_ID_LENGTH}}$`).test(
    input.trim().toUpperCase(),
  );
}

export function normalizePublicId(input: string): string {
  return input.trim().toUpperCase();
}
