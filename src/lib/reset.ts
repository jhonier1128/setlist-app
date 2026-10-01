import { createHash } from "crypto";

export const RESET_EXPIRES_MS = 60 * 60 * 1000; // 60 minutos

/** El token se guarda siempre en forma de hash, nunca en texto plano. */
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
