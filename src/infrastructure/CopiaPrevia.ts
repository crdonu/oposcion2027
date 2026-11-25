// Copia de los datos tal como estaban antes de la última adición desde archivo.
// Se guarda en este navegador para poder deshacerla.
import type { AppData } from '../domain/entities';
import { validarAppData } from '../application/useCases';

const KEY = 'oposicion-app:antes-de-anadir';

export interface Copia { fecha: string; data: AppData }

export const copiaPrevia = {
  guardar(data: AppData): void {
    try {
      localStorage.setItem(KEY, JSON.stringify({ fecha: new Date().toISOString(), data }));
    } catch { /* sin espacio o sin almacenamiento */ }
  },
  leer(): Copia | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const c = JSON.parse(raw) as Copia;
      return validarAppData(c.data) ? c : null;
    } catch {
      return null;
    }
  },
  borrar(): void {
    try { localStorage.removeItem(KEY); } catch { /* nada */ }
  },
};
