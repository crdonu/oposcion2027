import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FichaKind } from '../../domain/entities';
import { fichasDe, progresoFichas } from '../../domain/rules';
import * as uc from '../../application/useCases';
import { newId } from '../../application/ids';
import { useStore } from '../state/AppStore';
import { FichaGrid } from '../components/FichaGrid';
import { FichaPanel } from '../components/FichaPanel';
import { Icon } from '../components/Icons';
import { PageHeader, ProgressBar } from '../components/ui';
import { DocumentosConsulta } from '../components/DocumentosConsulta';

const COLOR = 'var(--c-prog)';

export function ProgramacionPage() {
  const { data, run } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const apartados = fichasDe(data, 'apartado');
  const unidades = fichasDe(data, 'unidad');
  const ficha = data.fichas.find((f) => f.id === selected);
  const contenido = data.requisitos.filter((r) => r.grupo === 'contenido');
  const formato = data.requisitos.filter((r) => r.grupo === 'formato');

  const crear = (kind: FichaKind) => {
    const id = newId();
    run((d) => uc.crearFicha(d, kind, id).data);
    setSelected(id);
  };

  const resumen = (label: string, kind: FichaKind, lista: typeof apartados, plural: [string, string, string]) => {
    const p = progresoFichas(lista);
    return (
      <>
        <div className="section-head">
          <h2>{label}</h2>
          <button className="btn" onClick={() => crear(kind)}><Icon name="plus" size={15} />{kind === 'apartado' ? 'Apartado' : 'Unidad'}</button>
        </div>
        <div className="row gap-3">
          <ProgressBar value={p.terminado} secondary={p.en_curso} total={p.total} height={8} />
          <span className="small muted nowrap">{p.terminado} {plural[0]} · {p.en_curso} {plural[1]} · {p.sin_empezar} {plural[2]}</span>
        </div>
      </>
    );
  };

  return (
    <div className={`with-panel ${ficha ? 'has-panel' : ''}`}>
      <div className="page">
        <PageHeader icon="programacion" color={COLOR} title="Programación" />
        {resumen('Apartados del documento', 'apartado', apartados, ['terminados', 'en curso', 'sin empezar'])}
        <FichaGrid fichas={apartados} color={COLOR} selectedId={selected ?? undefined} onSelect={setSelected} cols="grid-cards grid-dense" showPrefix={false} />
        {resumen('Unidades didácticas', 'unidad', unidades, ['terminadas', 'en curso', 'sin empezar'])}
        <FichaGrid fichas={unidades} color={COLOR} selectedId={selected ?? undefined} onSelect={setSelected} cols="grid-cards grid-dense" />

        <div className="req-strip">
          <span className="req-strip-title">Requisitos</span>
          {[['Contenido', contenido], ['Formato', formato]].map(([label, lista]) => {
            const l = lista as typeof contenido;
            const done = l.filter((r) => r.cumplido).length;
            return (
              <span key={label as string} className="req-strip-item">
                <span>{label as string}</span>
                <ProgressBar value={done} total={l.length} />
                <span className="muted nowrap">{done} de {l.length}</span>
              </span>
            );
          })}
          <Link className="btn" to="/programacion/requisitos">Ver lista completa <Icon name="right" size={16} /></Link>
        </div>

        <DocumentosConsulta />
      </div>
      {ficha && <FichaPanel key={ficha.id} ficha={ficha} color={COLOR} onClose={() => setSelected(null)} />}
    </div>
  );
}
