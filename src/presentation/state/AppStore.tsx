/* eslint-disable react-refresh/only-export-components */
// Estado de la aplicación en React. Aplica casos de uso y guarda con el repositorio inyectado.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AppData } from '../../domain/entities';
import type { DataRepository } from '../../application/ports';
import { crearDatosIniciales } from '../../application/seed';

interface Store {
  data: AppData;
  /** Aplica un caso de uso: (datos) => datos nuevos. Guarda sin recargar. */
  run: (useCase: (d: AppData) => AppData) => void;
  replaceAll: (d: AppData) => void;
}

const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ repository, children }: { repository: DataRepository; children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    let alive = true;
    repository.load().then((d) => {
      if (!alive) return;
      setData(d ?? crearDatosIniciales());
      loaded.current = true;
    });
    return () => {
      alive = false;
    };
  }, [repository]);

  useEffect(() => {
    if (data && loaded.current) void repository.save(data);
  }, [data, repository]);

  useEffect(() => {
    if (data) document.documentElement.dataset.theme = data.ajustes.tema === 'oscuro' ? 'dark' : 'light';
  }, [data]);

  const run = useCallback((apply: (d: AppData) => AppData) => {
    setData((d) => (d ? apply(d) : d));
  }, []);

  const replaceAll = useCallback((d: AppData) => setData(d), []);

  if (!data) return <div className="loading">Cargando…</div>;
  return <StoreContext.Provider value={{ data, run, replaceAll }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore fuera de AppStoreProvider');
  return s;
}
