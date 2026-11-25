// Vista previa de lo que se va a añadir desde un archivo.
import { useEffect, useRef } from 'react';
import type { PlanAdicion } from '../../application/anadir';

const COLOR: Record<string, string> = {
  tema: 'var(--c-tema)', caso: 'var(--c-caso)', apartado: 'var(--c-prog)', unidad: 'var(--c-prog)', plan: 'var(--c-plan)', req: 'var(--c-prog)',
};

export function AnadirDialog({ archivo, plan, onConfirm, onClose }: { archivo: string; plan: PlanAdicion; onConfirm: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  const nada = plan.total === 0;
  return (
    <dialog ref={ref} className="dialog dialog-wide" onClose={onClose} onCancel={onClose}>
      <form method="dialog" onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
        <h2>{nada ? 'No hay nada nuevo que añadir' : 'Se va a añadir'}</h2>
        <p className="small muted">Archivo: {archivo}</p>
        {(plan.lineas.length > 0 || plan.repetidos > 0) && (
          <div className="plan-table">
            {plan.lineas.map((l, i) => (
              <div key={i} className="plan-row">
                <span className="plan-donde" style={{ color: COLOR[l.kind ?? ''] }}>{l.donde}</span>
                <span className="plan-que">{l.que}</span>
              </div>
            ))}
            {plan.repetidos > 0 && (
              <div className="plan-row muted small">
                <span className="plan-donde">Ya lo tenías</span>
                <span className="plan-que">{plan.repetidos} {plan.repetidos === 1 ? 'elemento (no se repite)' : 'elementos (no se repiten)'}</span>
              </div>
            )}
          </div>
        )}
        {plan.avisos.length > 0 && (
          <ul className="plan-avisos">{plan.avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>
        )}
        {!nada && <p className="small muted">Antes de añadir, se guarda una copia de cómo está todo ahora, por si quieres volver atrás.</p>}
        <div className="dialog-actions">
          <span className="grow" />
          <button type="button" className="btn ghost" onClick={onClose}>{nada ? 'Cerrar' : 'Cancelar'}</button>
          {!nada && <button type="submit" className="btn primary">Añadir</button>}
        </div>
      </form>
    </dialog>
  );
}
