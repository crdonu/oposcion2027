// Ficha de detalle: se abre a la derecha y puede ponerse a pantalla completa.
import { useState } from 'react';
import { ESTADOS, ESTADO_LABEL, FICHA_PREFIX, type Estado, type Ficha } from '../../domain/entities';
import { progresoPasos } from '../../domain/rules';
import * as uc from '../../application/useCases';
import { useStore } from '../state/AppStore';
import { Icon } from './Icons';
import { Checkbox, ProgressBar } from './ui';

/** La primera línea de una nota con varias líneas se muestra como título, en negrita. */
function NotaTexto({ texto }: { texto: string }) {
  const i = texto.indexOf('\n');
  const cuerpo = i === -1 ? '' : texto.slice(i + 1).replace(/^\s*\n/, '');
  if (i === -1 || !cuerpo.trim()) return <p className="nota-text">{texto}</p>;
  return (
    <>
      <p className="nota-title">{texto.slice(0, i)}</p>
      <p className="nota-text">{cuerpo}</p>
    </>
  );
}

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function FichaPanel({ ficha, color, onClose }: { ficha: Ficha; color: string; onClose: () => void }) {
  const { run } = useStore();
  const [full, setFull] = useState(false);
  const [nuevoPaso, setNuevoPaso] = useState('');
  const [enlace, setEnlace] = useState({ titulo: '', url: '' });
  const [nuevaNota, setNuevaNota] = useState('');
  const [editNota, setEditNota] = useState<{ id: string; texto: string } | null>(null);
  const pp = progresoPasos(ficha);
  const id = ficha.id;

  const addPaso = () => {
    if (!nuevoPaso.trim()) return;
    run((d) => uc.anadirPaso(d, id, nuevoPaso.trim()));
    setNuevoPaso('');
  };
  const addEnlace = () => {
    if (!enlace.url.trim()) return;
    let url = enlace.url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    run((d) => uc.anadirEnlace(d, id, enlace.titulo.trim() || url, url));
    setEnlace({ titulo: '', url: '' });
  };
  const addNota = () => {
    if (!nuevaNota.trim()) return;
    run((d) => uc.anadirNota(d, id, nuevaNota.trim()));
    setNuevaNota('');
  };
  const borrar = () => {
    if (confirm(`¿Borrar ${FICHA_PREFIX[ficha.kind].toLowerCase()} ${ficha.numero}? No se puede deshacer.`)) {
      run((d) => uc.borrarFicha(d, id));
      onClose();
    }
  };

  return (
    <aside className={`ficha ${full ? 'is-full' : ''}`} aria-label={`Ficha de ${FICHA_PREFIX[ficha.kind]} ${ficha.numero}`}>
      <div className="ficha-top">
        <span className="ficha-kicker" style={{ color }}>{FICHA_PREFIX[ficha.kind]} {ficha.numero}</span>
        <span className="row gap-2">
          <button className="icon-btn" aria-label="Mover antes" title="Mover antes" onClick={() => run((d) => uc.moverFicha(d, id, -1))}><Icon name="up" /></button>
          <button className="icon-btn" aria-label="Mover después" title="Mover después" onClick={() => run((d) => uc.moverFicha(d, id, 1))}><Icon name="down" /></button>
          <button className="icon-btn" aria-label={full ? 'Reducir' : 'Pantalla completa'} title={full ? 'Reducir' : 'Pantalla completa'} onClick={() => setFull((f) => !f)}>
            <Icon name={full ? 'collapse' : 'expand'} />
          </button>
          <button className="icon-btn" aria-label="Cerrar ficha" onClick={onClose}><Icon name="close" /></button>
        </span>
      </div>
      <div className="ficha-body">
        <textarea rows={1} className="ficha-title" value={ficha.titulo} placeholder="Escribe el título"
          aria-label="Título" onChange={(e) => run((d) => uc.editarFicha(d, id, { titulo: e.target.value }))} />

        <div className="props">
          <span className="muted">Número</span>
          <input className="num-input" type="number" min={1} value={ficha.numero} aria-label="Número"
            onChange={(e) => run((d) => uc.editarFicha(d, id, { numero: Number(e.target.value) || ficha.numero }))} />
          <span className="muted">Estado</span>
          <select className={`estado-select chip-${ficha.estado}`} value={ficha.estado} aria-label="Estado"
            onChange={(e) => run((d) => uc.cambiarEstado(d, id, e.target.value as Estado))}>
            {ESTADOS.map((s) => <option key={s} value={s}>{ESTADO_LABEL[s]}</option>)}
          </select>
          <span className="muted">Progreso</span>
          <span className="row gap-3">
            <ProgressBar value={pp.hechos} total={pp.total} />
            <span className="small muted nowrap">{pp.total ? `${pp.hechos} de ${pp.total} pasos` : 'Sin pasos'}</span>
          </span>
        </div>

        <section className="ficha-section">
          <h3>Pasos</h3>
          {ficha.pasos.map((p) => (
            <div key={p.id} className="paso">
              <Checkbox checked={p.hecho} label="Marcar paso" onChange={(v) => run((d) => uc.editarPaso(d, id, p.id, { hecho: v }))} />
              <input className={`inline-input ${p.hecho ? 'is-done' : ''}`} value={p.texto} aria-label="Paso"
                onChange={(e) => run((d) => uc.editarPaso(d, id, p.id, { texto: e.target.value }))} />
              <button className="icon-btn subtle" aria-label="Borrar paso" onClick={() => run((d) => uc.borrarPaso(d, id, p.id))}><Icon name="trash" size={16} /></button>
            </div>
          ))}
          <form className="add-row" onSubmit={(e) => { e.preventDefault(); addPaso(); }}>
            <input value={nuevoPaso} placeholder="+ Añadir paso" aria-label="Nuevo paso" onChange={(e) => setNuevoPaso(e.target.value)} />
          </form>
        </section>

        <section className="ficha-section">
          <h3>Enlaces</h3>
          {ficha.enlaces.map((e) => (
            <div key={e.id} className="enlace">
              <Icon name="link" size={16} color="var(--muted)" />
              <a href={e.url} target="_blank" rel="noreferrer">{e.titulo}</a>
              <button className="icon-btn subtle" aria-label="Borrar enlace" onClick={() => run((d) => uc.borrarEnlace(d, id, e.id))}><Icon name="trash" size={16} /></button>
            </div>
          ))}
          <form className="enlace-form" onSubmit={(e) => { e.preventDefault(); addEnlace(); }}>
            <input value={enlace.titulo} placeholder="Nombre (p. ej., Esquema visual)" aria-label="Nombre del enlace"
              onChange={(e) => setEnlace((s) => ({ ...s, titulo: e.target.value }))} />
            <input value={enlace.url} placeholder="Pega el enlace de Drive" aria-label="Dirección del enlace"
              onChange={(e) => setEnlace((s) => ({ ...s, url: e.target.value }))} />
            <button className="btn" type="submit">Añadir</button>
          </form>
        </section>

        <section className="ficha-section">
          <h3>Notas</h3>
          <form className="nota-form" onSubmit={(e) => { e.preventDefault(); addNota(); }}>
            <textarea value={nuevaNota} rows={2} placeholder="Escribe una nota" aria-label="Nueva nota" onChange={(e) => setNuevaNota(e.target.value)} />
            <button className="btn" type="submit">Añadir nota</button>
          </form>
          {ficha.notas.map((n) => (
            <div key={n.id} className="nota">
              <div className="nota-head">
                <span className="small muted">{fecha(n.creada)}{n.editada ? ' · editada' : ''}</span>
                <span className="row">
                  <button className="icon-btn subtle" aria-label="Editar nota" onClick={() => setEditNota({ id: n.id, texto: n.texto })}><Icon name="edit" size={15} /></button>
                  <button className="icon-btn subtle" aria-label="Borrar nota" onClick={() => confirm('¿Borrar esta nota?') && run((d) => uc.borrarNota(d, id, n.id))}><Icon name="trash" size={15} /></button>
                </span>
              </div>
              {editNota?.id === n.id ? (
                <form onSubmit={(e) => { e.preventDefault(); run((d) => uc.editarNota(d, id, n.id, editNota.texto)); setEditNota(null); }}>
                  <textarea value={editNota.texto} rows={3} aria-label="Editar nota" onChange={(e) => setEditNota({ id: n.id, texto: e.target.value })} />
                  <span className="row gap-2"><button className="btn" type="submit">Guardar</button><button className="btn ghost" type="button" onClick={() => setEditNota(null)}>Cancelar</button></span>
                </form>
              ) : <NotaTexto texto={n.texto} />}
            </div>
          ))}
        </section>

        <button className="btn danger-ghost" onClick={borrar}><Icon name="trash" size={16} />Borrar {FICHA_PREFIX[ficha.kind].toLowerCase()}</button>
      </div>
    </aside>
  );
}
