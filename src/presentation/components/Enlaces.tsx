// Enlaces de una ficha o página. Los marcados como «Mostrar aquí» se ven como imagen
// dentro de la página (archivos guardados en Drive); el resto, como enlace normal.
import { useState } from 'react';
import type { Enlace } from '../../domain/entities';
import { Icon } from './Icons';

/** Id de un archivo de Drive a partir de su enlace (…/file/d/ID/…, …?id=ID). */
function driveId(url: string): string | null {
  const m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=|thumbnail\?(?:.*&)?id=)([\w-]{10,})/.exec(url)
    ?? /docs\.google\.com\/[^/]+\/d\/([\w-]{10,})/.exec(url);
  return m ? m[1] : null;
}

/** Dirección de la imagen que se muestra para un enlace. */
function imagenDe(url: string): string {
  const id = driveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w2000` : url;
}

function Esquema({ e, onToggle, onBorrar }: { e: Enlace; onToggle: () => void; onBorrar: () => void }) {
  const [error, setError] = useState(false);
  const [grande, setGrande] = useState(false);
  return (
    <figure className="esquema">
      {error ? (
        <div className="esquema-error">
          <p>No se puede mostrar este archivo.</p>
          <p className="small muted">En Drive, pulsa «Compartir» y elige «Cualquier persona con el enlace». Si es un PDF o un documento largo, pásalo a «Solo enlace».</p>
        </div>
      ) : (
        <button type="button" className="esquema-img" onClick={() => setGrande(true)} aria-label={`Ver ${e.titulo} en grande`}>
          <img src={imagenDe(e.url)} alt={e.titulo} loading="lazy" referrerPolicy="no-referrer" onError={() => setError(true)} />
        </button>
      )}
      <figcaption>
        <a href={e.url} target="_blank" rel="noreferrer">{e.titulo}</a>
        <span className="row">
          <button type="button" className="btn ghost small-btn" onClick={onToggle}>Solo enlace</button>
          <button type="button" className="icon-btn subtle" aria-label="Borrar" onClick={onBorrar}><Icon name="trash" size={15} /></button>
        </span>
      </figcaption>
      {grande && (
        <div className="lightbox" role="dialog" aria-label={e.titulo} onClick={() => setGrande(false)}>
          <img src={imagenDe(e.url)} alt={e.titulo} referrerPolicy="no-referrer" />
          <button type="button" className="icon-btn lightbox-close" aria-label="Cerrar"><Icon name="close" size={22} color="#fff" /></button>
        </div>
      )}
    </figure>
  );
}

export function EnlacesSection({ enlaces, onAdd, onToggle, onRemove }: {
  enlaces: Enlace[];
  onAdd: (titulo: string, url: string, mostrar: boolean) => void;
  onToggle: (id: string, mostrar: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [form, setForm] = useState({ titulo: '', url: '', mostrar: false });
  const esquemas = enlaces.filter((e) => e.mostrar);
  const normales = enlaces.filter((e) => !e.mostrar);

  const add = () => {
    let url = form.url.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    onAdd(form.titulo.trim() || (form.mostrar ? 'Archivo de Drive' : url), url, form.mostrar);
    setForm({ titulo: '', url: '', mostrar: false });
  };

  return (
    <>
      {esquemas.length > 0 && (
        <section className="ficha-section">
          <div className="esquemas">
            {esquemas.map((e) => (
              <Esquema key={e.id} e={e} onToggle={() => onToggle(e.id, false)} onBorrar={() => confirm('¿Quitarlo de aquí? (El archivo sigue en tu Drive.)') && onRemove(e.id)} />
            ))}
          </div>
        </section>
      )}
      <section className="ficha-section">
        <h3>Enlaces</h3>
        {normales.map((e) => (
          <div key={e.id} className="enlace">
            <Icon name="link" size={16} color="var(--muted)" />
            <a href={e.url} target="_blank" rel="noreferrer">{e.titulo}</a>
            <button type="button" className="btn ghost small-btn" title="Mostrar el archivo dentro de la página" onClick={() => onToggle(e.id, true)}>Mostrar aquí</button>
            <button type="button" className="icon-btn subtle" aria-label="Borrar enlace" onClick={() => onRemove(e.id)}><Icon name="trash" size={16} /></button>
          </div>
        ))}
        <form className="enlace-form" onSubmit={(ev) => { ev.preventDefault(); add(); }}>
          <input value={form.titulo} placeholder="Nombre" aria-label="Nombre del enlace"
            onChange={(ev) => setForm((s) => ({ ...s, titulo: ev.target.value }))} />
          <input value={form.url} placeholder="Pega el enlace de Drive" aria-label="Dirección del enlace"
            onChange={(ev) => setForm((s) => ({ ...s, url: ev.target.value }))} />
          <label className="field-inline small">
            <input type="checkbox" checked={form.mostrar} onChange={(ev) => setForm((s) => ({ ...s, mostrar: ev.target.checked }))} />
            Mostrar aquí
          </label>
          <button className="btn" type="submit">Añadir</button>
        </form>
      </section>
    </>
  );
}
