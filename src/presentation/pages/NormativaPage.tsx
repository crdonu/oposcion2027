// Normativa: páginas propias con título, texto, esquemas (de Drive) y enlaces.
import { lazy, Suspense, useState } from 'react';
import type { PaginaNormativa } from '../../domain/entities';
import * as uc from '../../application/useCases';
import { newId } from '../../application/ids';
import { useStore } from '../state/AppStore';
import { Icon } from '../components/Icons';
import { PageHeader } from '../components/ui';
import { EnlacesSection } from '../components/Enlaces';

const NotaEditor = lazy(() => import('../components/NotaEditor'));
const COLOR = 'var(--c-otro)';

function resumen(texto: string): string {
  const plano = texto.replace(/\*\*/g, '').replace(/^\s*[-•]\s+/gm, '').split('\n').map((l) => l.trim()).filter(Boolean).join(' · ');
  return plano.length > 140 ? `${plano.slice(0, 139)}…` : plano;
}

function PaginaPanel({ pagina, onClose }: { pagina: PaginaNormativa; onClose: () => void }) {
  const { run } = useStore();
  const [full, setFull] = useState(true);
  const id = pagina.id;
  const borrar = () => {
    if (confirm('¿Borrar esta página? No se puede deshacer. (Tus archivos siguen en Drive.)')) {
      run((d) => uc.borrarPagina(d, id));
      onClose();
    }
  };
  return (
    <aside className={`ficha ${full ? 'is-full' : ''}`} aria-label={pagina.titulo || 'Página de normativa'}>
      <div className="ficha-top">
        <span className="ficha-kicker" style={{ color: COLOR }}>Normativa</span>
        <span className="row gap-2">
          <button className="icon-btn" aria-label="Mover antes" title="Mover antes" onClick={() => run((d) => uc.moverPagina(d, id, -1))}><Icon name="up" /></button>
          <button className="icon-btn" aria-label="Mover después" title="Mover después" onClick={() => run((d) => uc.moverPagina(d, id, 1))}><Icon name="down" /></button>
          <button className="icon-btn" aria-label={full ? 'Reducir' : 'Pantalla completa'} title={full ? 'Reducir' : 'Pantalla completa'} onClick={() => setFull((f) => !f)}>
            <Icon name={full ? 'collapse' : 'expand'} />
          </button>
          <button className="icon-btn" aria-label="Cerrar página" onClick={onClose}><Icon name="close" /></button>
        </span>
      </div>
      <div className="ficha-body">
        <textarea rows={1} className="ficha-title" value={pagina.titulo} placeholder="Título de la página" aria-label="Título"
          onChange={(e) => run((d) => uc.editarPagina(d, id, { titulo: e.target.value }))} />
        <Suspense fallback={<div className="nota-editor is-loading" />}>
          <div className="pagina-texto">
            <NotaEditor key={id} value={pagina.texto} placeholder="Escribe aquí tu explicación"
              onChange={(texto) => run((d) => uc.editarPagina(d, id, { texto }))} />
          </div>
        </Suspense>
        <EnlacesSection enlaces={pagina.enlaces}
          onAdd={(titulo, url, mostrar) => run((d) => uc.anadirEnlacePagina(d, id, titulo, url, mostrar))}
          onToggle={(eid, mostrar) => run((d) => uc.editarEnlacePagina(d, id, eid, { mostrar }))}
          onRemove={(eid) => run((d) => uc.borrarEnlacePagina(d, id, eid))} />
        <button className="btn danger-ghost" onClick={borrar}><Icon name="trash" size={16} />Borrar página</button>
      </div>
    </aside>
  );
}

export function NormativaPage() {
  const { data, run } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const paginas = [...data.normativa].sort((a, b) => a.orden - b.orden);
  const pagina = paginas.find((p) => p.id === selected);

  const crear = () => {
    const id = newId();
    run((d) => uc.crearPagina(d, id));
    setSelected(id);
  };

  return (
    <div className={`with-panel ${pagina ? 'has-panel' : ''}`}>
      <div className="page">
        <PageHeader icon="normativa" color={COLOR} title="Normativa">
          <button className="btn primary" onClick={crear}><Icon name="plus" size={16} strokeWidth={2.2} />Nueva página</button>
        </PageHeader>
        {paginas.length === 0 ? (
          <p className="muted empty">Todavía no hay páginas. Pulsa «Nueva página» para crear la primera.</p>
        ) : (
          <div className="grid-cards grid-pages">
            {paginas.map((p) => {
              const esquemas = p.enlaces.filter((e) => e.mostrar).length;
              return (
                <button key={p.id} className={`card ${p.id === selected ? 'is-selected' : ''}`} onClick={() => setSelected(p.id)}>
                  <span className="card-text">
                    <span className={`card-title card-title-big ${p.titulo ? '' : 'is-empty'}`}>{p.titulo || 'Sin título'}</span>
                    {p.texto && <span className="card-snippet">{resumen(p.texto)}</span>}
                  </span>
                  {esquemas > 0 && <span className="small muted">{esquemas} {esquemas === 1 ? 'esquema' : 'esquemas'}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {pagina && <PaginaPanel key={pagina.id} pagina={pagina} onClose={() => setSelected(null)} />}
    </div>
  );
}
