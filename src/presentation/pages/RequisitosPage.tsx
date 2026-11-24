import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { RequisitoGrupo } from '../../domain/entities';
import * as uc from '../../application/useCases';
import { useStore } from '../state/AppStore';
import { Icon } from '../components/Icons';
import { Checkbox, ProgressBar } from '../components/ui';

function Grupo({ grupo, titulo }: { grupo: RequisitoGrupo; titulo: string }) {
  const { data, run } = useStore();
  const [nuevo, setNuevo] = useState('');
  const lista = data.requisitos.filter((r) => r.grupo === grupo).sort((a, b) => a.orden - b.orden);
  const done = lista.filter((r) => r.cumplido).length;
  return (
    <section className={`req-group req-${grupo}`}>
      <div className="row gap-3">
        <h2>{titulo}</h2>
        <ProgressBar value={done} total={lista.length} />
        <span className="small muted nowrap">{done} de {lista.length}</span>
      </div>
      <div className={grupo === 'contenido' ? 'req-list two-cols' : 'req-list'}>
        {lista.map((r) => (
          <div key={r.id} className="req-item">
            <Checkbox checked={r.cumplido} label="Marcar requisito" onChange={(v) => run((d) => uc.editarRequisito(d, r.id, { cumplido: v }))} />
            <textarea rows={1} className={`inline-input autosize ${r.cumplido ? 'is-done' : ''}`} value={r.texto} aria-label="Requisito"
              onChange={(e) => run((d) => uc.editarRequisito(d, r.id, { texto: e.target.value }))} />
            <button className="icon-btn subtle" aria-label="Borrar requisito" onClick={() => confirm('¿Borrar este requisito?') && run((d) => uc.borrarRequisito(d, r.id))}><Icon name="trash" size={15} /></button>
          </div>
        ))}
      </div>
      <form className="add-row" onSubmit={(e) => { e.preventDefault(); if (nuevo.trim()) { run((d) => uc.anadirRequisito(d, grupo, nuevo.trim())); setNuevo(''); } }}>
        <input value={nuevo} placeholder="+ Añadir requisito" aria-label="Nuevo requisito" onChange={(e) => setNuevo(e.target.value)} />
      </form>
    </section>
  );
}

export function RequisitosPage() {
  return (
    <div className="page">
      <Link to="/programacion" className="back-link"><Icon name="left" size={16} />Programación</Link>
      <div className="page-header">
        <h1>Requisitos</h1>
        <span className="small muted">Edítalos cuando salga la convocatoria de 2027.</span>
      </div>
      <div className="req-layout">
        <Grupo grupo="contenido" titulo="Contenido" />
        <Grupo grupo="formato" titulo="Formato" />
      </div>
    </div>
  );
}
