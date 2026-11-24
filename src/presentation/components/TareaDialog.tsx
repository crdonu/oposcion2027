// Diálogo para crear o editar una tarea del calendario.
import { useEffect, useRef, useState } from 'react';
import { TAREA_TIPO_LABEL, type Tarea, type TareaTipo } from '../../domain/entities';
import { etiquetaFicha } from '../../domain/rules';
import * as uc from '../../application/useCases';
import { useStore } from '../state/AppStore';

const TIPO_A_KIND: Record<TareaTipo, Array<'tema' | 'caso' | 'apartado' | 'unidad'>> = {
  tema: ['tema'], caso: ['caso'], programacion: ['apartado', 'unidad'], otro: [],
};

export type TareaDraft = Omit<Tarea, 'id'> & { id?: string };

export function TareaDialog({ draft, onClose }: { draft: TareaDraft; onClose: () => void }) {
  const { data, run } = useStore();
  const [t, setT] = useState<TareaDraft>(draft);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  const opciones = data.fichas
    .filter((f) => TIPO_A_KIND[t.tipo].includes(f.kind as never))
    .sort((a, b) => (a.kind === b.kind ? a.orden - b.orden : a.kind.localeCompare(b.kind)));

  const elegirFicha = (fichaId: string) => {
    const f = data.fichas.find((x) => x.id === fichaId);
    setT((s) => ({
      ...s,
      fichaId: fichaId || undefined,
      titulo: f && (!s.titulo || s.titulo === autoTitulo(s.fichaId)) ? autoTitulo(fichaId) : s.titulo,
    }));
  };

  function autoTitulo(fichaId?: string): string {
    const f = data.fichas.find((x) => x.id === fichaId);
    if (!f) return '';
    return f.titulo ? `${etiquetaFicha(f)} · ${f.titulo}` : etiquetaFicha(f);
  }

  const guardar = () => {
    const titulo = t.titulo.trim() || autoTitulo(t.fichaId);
    if (!titulo) return;
    const { id, ...rest } = { ...t, titulo };
    if (id) run((d) => uc.editarTarea(d, id, rest));
    else run((d) => uc.crearTarea(d, rest));
    onClose();
  };

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} onCancel={onClose}>
      <form method="dialog" onSubmit={(e) => { e.preventDefault(); guardar(); }}>
        <h2>{t.id ? 'Editar tarea' : 'Nueva tarea'}</h2>
        <label className="field"><span>Tipo</span>
          <select value={t.tipo} onChange={(e) => setT((s) => ({ ...s, tipo: e.target.value as TareaTipo, fichaId: undefined }))}>
            {(Object.keys(TAREA_TIPO_LABEL) as TareaTipo[]).map((k) => <option key={k} value={k}>{TAREA_TIPO_LABEL[k]}</option>)}
          </select>
        </label>
        {opciones.length > 0 && (
          <label className="field"><span>Relacionada con</span>
            <select value={t.fichaId ?? ''} onChange={(e) => elegirFicha(e.target.value)}>
              <option value="">— Ninguna —</option>
              {opciones.map((f) => <option key={f.id} value={f.id}>{etiquetaFicha(f)}{f.titulo ? ` · ${f.titulo}` : ''}</option>)}
            </select>
          </label>
        )}
        <label className="field"><span>Qué hay que hacer</span>
          <input value={t.titulo} autoFocus placeholder="p. ej., Esquema del tema 13" onChange={(e) => setT((s) => ({ ...s, titulo: e.target.value }))} />
        </label>
        <label className="field"><span>Día</span>
          <input type="date" value={t.fecha} required onChange={(e) => e.target.value && setT((s) => ({ ...s, fecha: e.target.value }))} />
        </label>
        <label className="field-inline">
          <input type="checkbox" checked={t.hecha} onChange={(e) => setT((s) => ({ ...s, hecha: e.target.checked }))} /> Hecha
        </label>
        <div className="dialog-actions">
          {t.id && <button type="button" className="btn danger-ghost" onClick={() => { if (confirm('¿Borrar esta tarea?')) { run((d) => uc.borrarTarea(d, t.id!)); onClose(); } }}>Borrar</button>}
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary">Guardar</button>
        </div>
      </form>
    </dialog>
  );
}
