import { useRef, useState, useSyncExternalStore } from 'react';
import { pwa } from '../../infrastructure/pwa';
import * as uc from '../../application/useCases';
import { aplicarAdicion, leerAdicion, planAdicion, type Adicion, type PlanAdicion } from '../../application/anadir';
import { copiaPrevia } from '../../infrastructure/CopiaPrevia';
import { AnadirDialog } from '../components/AnadirDialog';
import { useStore } from '../state/AppStore';
import { Icon } from '../components/Icons';
import { PageHeader, Segmented } from '../components/ui';

export function AjustesPage({ onLogout, cloud }: { onLogout: () => void; cloud: boolean }) {
  const { data, run, replaceAll } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [msgAnadir, setMsgAnadir] = useState('');
  const [pendiente, setPendiente] = useState<{ archivo: string; adicion: Adicion; plan: PlanAdicion } | null>(null);
  const [copia, setCopia] = useState(() => copiaPrevia.leer());
  const canInstall = useSyncExternalStore(pwa.subscribe, pwa.canInstall);

  const exportar = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `oposicion-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importar = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!uc.validarAppData(parsed)) { setMsg('Ese archivo no tiene el formato de la aplicación.'); return; }
      if (confirm('Esto sustituye todos tus datos por los del archivo. ¿Seguir?')) { replaceAll(parsed); setMsg('Copia restaurada.'); }
    } catch {
      setMsg('No se ha podido leer el archivo.');
    }
  };

  const elegirAdicion = async (file: File) => {
    setMsgAnadir('');
    try {
      const r = leerAdicion(JSON.parse(await file.text()));
      if (!r.ok) { setMsgAnadir(r.error); return; }
      setPendiente({ archivo: file.name, adicion: r.adicion, plan: planAdicion(data, r.adicion) });
    } catch {
      setMsgAnadir('No se ha podido leer el archivo. Tiene que ser un archivo .json.');
    }
  };

  const confirmarAdicion = () => {
    if (!pendiente) return;
    copiaPrevia.guardar(data);
    setCopia(copiaPrevia.leer());
    const { adicion, plan } = pendiente;
    run((d) => aplicarAdicion(d, adicion));
    setMsgAnadir(`Añadido: ${plan.total} ${plan.total === 1 ? 'elemento' : 'elementos'}.`);
    setPendiente(null);
  };

  const deshacerAdicion = () => {
    if (!copia) return;
    if (!confirm('Tus datos volverán a como estaban antes de la última adición. Se perderá también lo que hayas cambiado después. ¿Seguir?')) return;
    replaceAll(copia.data);
    copiaPrevia.borrar();
    setCopia(null);
    setMsgAnadir('Se ha deshecho la última adición.');
  };

  return (
    <div className="page page-narrow">
      <PageHeader icon="ajustes" color="var(--muted)" title="Ajustes" />
      <section className="settings-block">
        <h2>Apariencia</h2>
        <Segmented value={data.ajustes.tema} options={[['claro', 'Claro'], ['oscuro', 'Oscuro']]} onChange={(tema) => run((d) => uc.editarAjustes(d, { tema }))} />
      </section>
      <section className="settings-block">
        <h2>Instalar en este aparato</h2>
        {pwa.isInstalled() ? (
          <p className="small muted">Ya la estás usando como aplicación instalada.</p>
        ) : canInstall ? (
          <span><button className="btn primary" onClick={() => void pwa.install()}>Instalar aplicación</button></span>
        ) : (
          <p className="small muted">En Android: menú ⋮ de Chrome → «Instalar aplicación» o «Añadir a pantalla de inicio». En iPhone: botón Compartir de Safari → «Añadir a pantalla de inicio».</p>
        )}
      </section>
      <section className="settings-block">
        <h2>Fechas de la planificación</h2>
        <label className="field"><span>Último día de estudio (después, repaso)</span>
          <input type="date" value={data.ajustes.finEstudio} onChange={(e) => e.target.value && run((d) => uc.editarAjustes(d, { finEstudio: e.target.value }))} />
        </label>
        <label className="field"><span>Fecha del examen</span>
          <input type="date" value={data.ajustes.fechaExamen} onChange={(e) => e.target.value && run((d) => uc.editarAjustes(d, { fechaExamen: e.target.value }))} />
        </label>
      </section>
      <section className="settings-block">
        <h2>Copia de seguridad</h2>
        <p className="small muted">Descarga todos tus datos en un archivo, o vuelve a cargar una copia completa (sustituye todo lo que tienes).</p>
        <span className="row gap-2 wrap">
          <button className="btn" onClick={exportar}>Descargar copia</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Restaurar copia completa</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { if (e.target.files?.[0]) void importar(e.target.files[0]); e.target.value = ''; }} />
        </span>
        {msg && <p className="small">{msg}</p>}
      </section>
      <section className="settings-block">
        <h2>Añadir desde un archivo</h2>
        <p className="small muted">Suma a tus datos lo que venga en el archivo (pasos, notas, enlaces, tareas o requisitos). No borra ni cambia nada de lo que ya tienes.</p>
        <span className="row gap-2 wrap">
          <button className="btn primary" onClick={() => addRef.current?.click()}>Elegir archivo…</button>
          {copia && <button className="btn" onClick={deshacerAdicion}>Deshacer la última adición ({new Date(copia.fecha).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})</button>}
          <input ref={addRef} type="file" accept="application/json,.json" hidden onChange={(e) => { if (e.target.files?.[0]) void elegirAdicion(e.target.files[0]); e.target.value = ''; }} />
        </span>
        {msgAnadir && <p className="small">{msgAnadir}</p>}
      </section>
      {pendiente && <AnadirDialog archivo={pendiente.archivo} plan={pendiente.plan} onConfirm={confirmarAdicion} onClose={() => setPendiente(null)} />}
      <section className="settings-block">
        <h2>Sesión</h2>
        <p className="small muted">{cloud ? 'Tus datos se guardan en la nube y se sincronizan entre el ordenador y el móvil.' : 'Modo local: los datos se guardan solo en este navegador.'}</p>
        <button className="btn" onClick={onLogout}><Icon name="logout" size={16} />Cerrar sesión</button>
      </section>
    </div>
  );
}
