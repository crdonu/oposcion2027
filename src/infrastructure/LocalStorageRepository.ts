// Adaptador de almacenamiento en el navegador. Se sustituirá por uno en la nube
// (implementando el mismo DataRepository) cuando se elija base de datos.
import type { DataRepository } from '../application/ports';
import type { AppData } from '../domain/entities';
import { validarAppData } from '../application/useCases';

export class LocalStorageRepository implements DataRepository {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  async load(): Promise<AppData | null> {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return validarAppData(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  async save(data: AppData): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch {
      // Sin almacenamiento disponible (modo privado): los datos viven solo en memoria.
    }
  }
}
