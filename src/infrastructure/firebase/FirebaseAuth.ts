// Acceso con Firebase Authentication. La usuaria solo escribe la contraseña:
// el correo de su cuenta está en la configuración.
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import type { AuthService } from '../../application/ports';

export class FirebaseAuth implements AuthService {
  private readonly auth: Auth;
  private readonly email: string;

  constructor(auth: Auth, email: string) {
    this.auth = auth;
    this.email = email;
  }

  init(): Promise<boolean> {
    return new Promise((resolve) => {
      const stop = onAuthStateChanged(this.auth, (user) => {
        stop();
        resolve(Boolean(user));
      });
    });
  }

  async login(password: string): Promise<boolean> {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      await signInWithEmailAndPassword(this.auth, this.email, password);
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
