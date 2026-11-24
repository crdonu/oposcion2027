import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { AuthService, DataRepository } from '../application/ports';
import { AppStoreProvider } from './state/AppStore';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { PlanificacionPage } from './pages/PlanificacionPage';
import { FichasPage } from './pages/FichasPage';
import { ProgramacionPage } from './pages/ProgramacionPage';
import { RequisitosPage } from './pages/RequisitosPage';
import { ConvocatoriaPage } from './pages/ConvocatoriaPage';
import { AjustesPage } from './pages/AjustesPage';

export function App({ auth, repository, cloud }: { auth: AuthService; repository: DataRepository; cloud: boolean }) {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    auth.init().then(setLogged);
  }, [auth]);

  if (logged === null) return <div className="loading">Cargando…</div>;

  if (!logged) {
    return <LoginPage onLogin={async (pw) => { const ok = await auth.login(pw); if (ok) setLogged(true); return ok; }} />;
  }

  return (
    <AppStoreProvider repository={repository}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/planificacion" element={<PlanificacionPage />} />
            <Route path="/temario" element={<FichasPage key="tema" kind="tema" title="Temario" icon="tema" color="var(--c-tema)" nuevo="Nuevo tema" />} />
            <Route path="/casos" element={<FichasPage key="caso" kind="caso" title="Casos prácticos" icon="caso" color="var(--c-caso)" nuevo="Nuevo caso" />} />
            <Route path="/programacion" element={<ProgramacionPage />} />
            <Route path="/programacion/requisitos" element={<RequisitosPage />} />
            <Route path="/convocatoria" element={<ConvocatoriaPage />} />
            <Route path="/ajustes" element={<AjustesPage cloud={cloud} onLogout={async () => { await auth.logout(); setLogged(false); }} />} />
            <Route path="*" element={<Navigate to="/planificacion" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppStoreProvider>
  );
}
