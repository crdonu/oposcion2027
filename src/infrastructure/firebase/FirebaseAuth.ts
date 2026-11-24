// Acceso con Firebase Authentication: correo y contraseña de la cuenta.
// No hay ningún dato de la cuenta en el código.
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import type { AuthService, Credentials } from '../../application/ports';

export class FirebaseAuth implements AuthService {
  readonly needsEmail = true;
  private readonly auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  init(): Promise<boolean> {
    return new Promise((resolve) => {
      const stop = onAuthStateChanged(this.auth, (user) => {
        stop();
        resolve(Boolean(user));
      });
    });
  }

  async login({ email, password }: Credentials): Promise<boolean> {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      await signInWithEmailAndPassword(this.auth, email.trim(), password);
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
