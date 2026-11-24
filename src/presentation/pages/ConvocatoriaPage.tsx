import { useState } from 'react';
import * as uc from '../../application/useCases';
import { useStore } from '../state/AppStore';
import { Icon } from '../components/Icons';
import { PageHeader } from '../components/ui';

export function ConvocatoriaPage() {
  const { data, run } = useStore();
  const [editando, setEditando] = useState(false);
  const secciones = [...data.convocatoria].sort((a, b) => a.orden - b.orden);

  return (
    <div className="page page-narrow">
      <PageHeader icon="convocatoria" color="var(--c-otro)" title="Convocatoria">
        {editando && <button className="btn" onClick={() => run(uc.anadirSeccion)}><Icon name="plus" size={15} />Sección</button>}
        <button className={`btn ${editando ? 'primary' : ''}`} onClick={() => setEditando((e) => !e)}>
          {editando ? 'Hecho' : <><Icon name="edit" size={15} />Editar</>}
        </button>
      </PageHeader>
      <div className="conv-grid">
        {secciones.map((s) => (
          <section key={s.id} className="conv-card">
            {editando ? (
              <>
                <input className="conv-title-input" value={s.titulo} aria-label="Título de la sección" onChange={(e) => run((d) => uc.editarSeccion(d, s.id, { titulo: e.target.value }))} />
                <textarea rows={6} value={s.texto} aria-label="Texto de la sección" onChange={(e) => run((d) => uc.editarSeccion(d, s.id, { texto: e.target.value }))} />
                <button className="btn danger-ghost" onClick={() => confirm('¿Borrar esta sección?') && run((d) => uc.borrarSeccion(d, s.id))}><Icon name="trash" size={15} />Borrar</button>
              </>
            ) : (
              <>
                <h2>{s.titulo}</h2>
                <p className="pre">{s.texto}</p>
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
