/* eslint-disable react-refresh/only-export-components */
// Estado de la aplicación en React. Aplica casos de uso y guarda con el repositorio inyectado.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AppData } from '../../domain/entities';
import type { DataRepository } from '../../application/ports';
import { crearDatosIniciales } from '../../application/seed';
import { migrar } from '../../application/useCases';

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
  const skipSave = useRef(false);

  useEffect(() => {
    let alive = true;
    repository.load().then((d) => {
      if (!alive) return;
      setData(d ? migrar(d) : crearDatosIniciales());
      loaded.current = true;
    });
    return () => {
      alive = false;
    };
  }, [repository]);

  // Cambios hechos en otro aparato (solo con base de datos en la nube).
  useEffect(() => {
    if (!data || !repository.subscribe) return;
    const stop = repository.subscribe((remote) => {
      skipSave.current = true;
      setData(migrar(remote));
    });
    return stop;
    // Se suscribe una vez cargados los datos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, data === null]);

  useEffect(() => {
    if (!data || !loaded.current) return;
    if (skipSave.current) { skipSave.current = false; return; }
    void repository.save(data);
  }, [data, repository]);

  useEffect(() => {
    if (data) document.documentElement.dataset.theme = data.ajustes.tema === 'oscuro' ? 'dark' : 'light';
  }, [data]);

  const run = useCallback((apply: (d: AppData) => AppData) => {
    setData((d) => (d ? apply(d) : d));
  }, []);

  const replaceAll = useCallback((d: AppData) => setData(migrar(d)), []);

  if (!data) return <div className="loading">Cargando…</div>;
  return <StoreContext.Provider value={{ data, run, replaceAll }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore fuera de AppStoreProvider');
  return s;
}
