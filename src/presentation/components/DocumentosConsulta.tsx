// «Documentos de consulta» de la programación: enlace + breve explicación.
import { useState } from 'react';
import type { DocumentoConsulta } from '../../domain/entities';
import * as uc from '../../application/useCases';
import { useStore } from '../state/AppStore';
import { Icon } from './Icons';
import { MenuMas } from './Menu';

type Borrador = { titulo: string; url: string; explicacion: string };
const VACIO: Borrador = { titulo: '', url: '', explicacion: '' };

function normalizaUrl(u: string): string {
  const t = u.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function Formulario({ inicial, boton, onGuardar, onCancelar }: { inicial: Borrador; boton: string; onGuardar: (b: Borrador) => void; onCancelar: () => void }) {
  const [b, setB] = useState(inicial);
  return (
    <form className="doc-form" onSubmit={(e) => { e.preventDefault(); if (b.url.trim()) onGuardar({ ...b, url: normalizaUrl(b.url) }); }}>
      <input value={b.titulo} placeholder="Nombre del documento" aria-label="Nombre del documento" autoFocus onChange={(e) => setB({ ...b, titulo: e.target.value })} />
      <input value={b.url} placeholder="Pega el enlace" aria-label="Enlace del documento" onChange={(e) => setB({ ...b, url: e.target.value })} />
      <textarea value={b.explicacion} rows={2} placeholder="Explicación breve: qué es y para qué te sirve" aria-label="Explicación breve" onChange={(e) => setB({ ...b, explicacion: e.target.value })} />
      <span className="row gap-2">
        <button className="btn small-btn" type="submit">{boton}</button>
        <button className="link-btn" type="button" onClick={onCancelar}>Cancelar</button>
      </span>
    </form>
  );
}

function Fila({ doc }: { doc: DocumentoConsulta }) {
  const { run } = useStore();
  const [editando, setEditando] = useState(false);
  if (editando) {
    return (
      <div className="doc-row">
        <Formulario inicial={{ titulo: doc.titulo, url: doc.url, explicacion: doc.explicacion }} boton="Guardar"
          onGuardar={(b) => { run((d) => uc.editarDocumento(d, doc.id, { ...b, titulo: b.titulo.trim() || b.url, explicacion: b.explicacion.trim() })); setEditando(false); }}
          onCancelar={() => setEditando(false)} />
      </div>
    );
  }
  return (
    <div className="doc-row">
      <Icon name="link" size={16} color="var(--muted)" />
      <span className="doc-text">
        <a href={doc.url} target="_blank" rel="noreferrer">{doc.titulo}</a>
        {doc.explicacion && <span className="doc-expl">{doc.explicacion}</span>}
      </span>
      <MenuMas label={`Opciones de ${doc.titulo}`} opciones={[
        { label: 'Abrir', onClick: () => window.open(doc.url, '_blank', 'noreferrer') },
        { label: 'Editar', onClick: () => setEditando(true) },
        { label: 'Quitar', onClick: () => { if (confirm('¿Quitar este documento de la lista? (El archivo no se borra.)')) run((d) => uc.borrarDocumento(d, doc.id)); }, danger: true },
      ]} />
    </div>
  );
}

export function DocumentosConsulta() {
  const { data, run } = useStore();
  const [anadiendo, setAnadiendo] = useState(false);
  const docs = [...data.documentos].sort((a, b) => a.orden - b.orden);
  return (
    <section className="docs-block">
      <h2>Documentos de consulta</h2>
      {docs.map((doc) => <Fila key={doc.id} doc={doc} />)}
      {anadiendo ? (
        <Formulario inicial={VACIO} boton="Añadir"
          onGuardar={(b) => { run((d) => uc.anadirDocumento(d, { titulo: b.titulo.trim() || b.url, url: b.url, explicacion: b.explicacion.trim() })); setAnadiendo(false); }}
          onCancelar={() => setAnadiendo(false)} />
      ) : (
        <button type="button" className="link-btn" onClick={() => setAnadiendo(true)}>+ Añadir documento</button>
      )}
    </section>
  );
}
