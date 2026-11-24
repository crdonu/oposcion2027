// Puertos: lo que la aplicación necesita del exterior. La infraestructura los implementa.
import type { AppData } from '../domain/entities';

/** Dónde se guardan los datos. Hoy: el navegador. Mañana: una base de datos en la nube. */
export interface DataRepository {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
}

/** Control de acceso a la aplicación. */
export interface AuthService {
  isAuthenticated(): boolean;
  login(password: string): Promise<boolean>;
  logout(): void;
}
