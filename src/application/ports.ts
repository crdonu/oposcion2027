// Puertos: lo que la aplicación necesita del exterior. La infraestructura los implementa.
import type { AppData } from '../domain/entities';

/** Dónde se guardan los datos: el navegador o una base de datos en la nube. */
export interface DataRepository {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
  /**
   * Opcional: avisa cuando los datos cambian desde otro aparato.
   * Devuelve la función para dejar de escuchar.
   */
  subscribe?(onRemoteChange: (data: AppData) => void): () => void;
}

export interface Credentials {
  email: string;
  password: string;
}

/** Control de acceso a la aplicación. */
export interface AuthService {
  /** Si el acceso pide correo además de contraseña. */
  readonly needsEmail: boolean;
  /** Comprueba si ya hay una sesión abierta (puede ser asíncrono). */
  init(): Promise<boolean>;
  login(credentials: Credentials): Promise<boolean>;
  logout(): Promise<void>;
}
