// Acceso solo con contraseña, sin servidor (modo local). Es una barrera de
// entrada, no una protección fuerte: se usa cuando Firebase no está configurado.
import type { AuthService } from '../application/ports';

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class PasswordAuth implements AuthService {
  private readonly expectedHash: string;
  private readonly sessionKey: string;

  constructor(expectedHash: string, sessionKey: string) {
    this.expectedHash = expectedHash;
    this.sessionKey = sessionKey;
  }

  async init(): Promise<boolean> {
    try {
      return localStorage.getItem(this.sessionKey) === this.expectedHash;
    } catch {
      return false;
    }
  }

  async login(password: string): Promise<boolean> {
    const ok = (await sha256Hex(password)) === this.expectedHash;
    if (ok) {
      try {
        localStorage.setItem(this.sessionKey, this.expectedHash);
      } catch {
        /* sesión solo en memoria */
      }
    }
    return ok;
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch {
      /* nada */
    }
  }
}
