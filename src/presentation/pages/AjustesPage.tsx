import { useRef, useState } from 'react';
import * as uc from '../../application/useCases';
import { useStore } from '../state/AppStore';
import { Icon } from '../components/Icons';
import { PageHeader, Segmented } from '../components/ui';

export function AjustesPage({ onLogout }: { onLogout: () => void }) {
  const { data, run, replaceAll } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

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
      if (confirm('Esto sustituye todos tus datos por los del archivo. ¿Seguir?')) { replaceAll(parsed); setMsg('Datos importados.'); }
    } catch {
      setMsg('No se ha podido leer el archivo.');
    }
  };

  return (
    <div className="page page-narrow">
      <PageHeader icon="ajustes" color="var(--muted)" title="Ajustes" />
      <section className="settings-block">
        <h2>Apariencia</h2>
        <Segmented value={data.ajustes.tema} options={[['claro', 'Claro'], ['oscuro', 'Oscuro']]} onChange={(tema) => run((d) => uc.editarAjustes(d, { tema }))} />
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
        <p className="small muted">Descarga todos tus datos en un archivo. También sirve para pasárselo a Claude.</p>
        <span className="row gap-2 wrap">
          <button className="btn" onClick={exportar}>Descargar copia</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Cargar copia</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} />
        </span>
        {msg && <p className="small">{msg}</p>}
      </section>
      <section className="settings-block">
        <button className="btn" onClick={onLogout}><Icon name="logout" size={16} />Cerrar sesión</button>
      </section>
    </div>
  );
}
