// Normativa: páginas propias con título, texto, imágenes (de Drive) y enlaces.
// La página se lee limpia, como un documento; «Editar» abre el editor y «Guardar» lo cierra.
import { lazy, Suspense, useState } from 'react';
import type { PaginaNormativa } from '../../domain/entities';
import * as uc from '../../application/useCases';
import { newId } from '../../application/ids';
import { useStore } from '../state/AppStore';
import { Icon } from '../components/Icons';
import { PageHeader } from '../components/ui';
import { EnlacesSection } from '../components/Enlaces';
import { NotaRender } from '../components/notaFormat';

const NotaEditor = lazy(() => import('../components/NotaEditor'));
const COLOR = 'var(--c-norm)';

function PaginaPanel({ pagina, editarAlAbrir, onClose }: { pagina: PaginaNormativa; editarAlAbrir: boolean; onClose: () => void }) {
  const { run } = useStore();
  const [full, setFull] = useState(false);
  const [borrador, setBorrador] = useState<{ titulo: string; texto: string } | null>(
    editarAlAbrir ? { titulo: pagina.titulo, texto: pagina.texto } : null,
  );
  const id = pagina.id;

  const guardar = () => {
    if (!borrador) return;
    run((d) => uc.editarPagina(d, id, { titulo: borrador.titulo.trim(), texto: borrador.texto }));
    setBorrador(null);
  };
  const borrar = () => {
    if (confirm('¿Borrar esta página? No se puede deshacer. (Tus archivos siguen en Drive.)')) {
      run((d) => uc.borrarPagina(d, id));
      onClose();
    }
  };

  return (
    <aside className={`ficha ${full ? 'is-full' : ''}`} aria-label={pagina.titulo || 'Página de normativa'}>
      <div className="ficha-top">
        <span className="ficha-kicker" style={{ color: COLOR }}><Icon name="normativa" size={18} color={COLOR} /></span>
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
        {borrador ? (
          <form className="pagina-lectura" onSubmit={(e) => { e.preventDefault(); guardar(); }}>
            <textarea rows={1} className="ficha-title" value={borrador.titulo} placeholder="Título" aria-label="Título" autoFocus={!pagina.titulo}
              onChange={(e) => setBorrador((b) => (b ? { ...b, titulo: e.target.value } : b))} />
            <Suspense fallback={<div className="nota-editor is-loading" />}>
              <div className="pagina-texto">
                <NotaEditor value={borrador.texto} placeholder="Escribe aquí tu explicación" autoFocus={Boolean(pagina.titulo)}
                  onChange={(texto) => setBorrador((b) => (b ? { ...b, texto } : b))} />
              </div>
            </Suspense>
            <div className="pagina-acciones">
              <button className="btn primary" type="submit">Guardar</button>
              <button className="btn ghost" type="button" onClick={() => setBorrador(null)}>Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="pagina-lectura">
            <h2 className={`pagina-titulo ${pagina.titulo ? '' : 'is-empty'}`}>{pagina.titulo || 'Sin título'}</h2>
            {pagina.texto.trim()
              ? <NotaRender texto={pagina.texto} />
              : <p className="pagina-vacia">Todavía no has escrito nada en esta página.</p>}
            <div className="pagina-acciones">
              <button className="btn" onClick={() => setBorrador({ titulo: pagina.titulo, texto: pagina.texto })}><Icon name="edit" size={15} />Editar</button>
            </div>
          </div>
        )}
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
  const [recienCreada, setRecienCreada] = useState<string | null>(null);
  const paginas = [...data.normativa].sort((a, b) => a.orden - b.orden);
  const pagina = paginas.find((p) => p.id === selected);

  const crear = () => {
    const id = newId();
    run((d) => uc.crearPagina(d, id));
    setRecienCreada(id);
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
          <div className="grid-cards">
            {paginas.map((p) => (
              <button key={p.id} className={`card card-page ${p.id === selected ? 'is-selected' : ''}`} onClick={() => setSelected(p.id)}>
                <Icon name="normativa" size={18} color={COLOR} />
                <span className={`card-title ${p.titulo ? '' : 'is-empty'}`}>{p.titulo || 'Sin título'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {pagina && <PaginaPanel key={pagina.id} pagina={pagina} editarAlAbrir={pagina.id === recienCreada} onClose={() => { setSelected(null); setRecienCreada(null); }} />}
    </div>
  );
}
