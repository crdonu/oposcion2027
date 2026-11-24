// Temario y Casos prácticos: tarjetas con estado + ficha.
import { useState } from 'react';
import type { Estado, FichaKind } from '../../domain/entities';
import { fichasDe, progresoFichas } from '../../domain/rules';
import * as uc from '../../application/useCases';
import { newId } from '../../application/ids';
import { useStore } from '../state/AppStore';
import { FichaGrid } from '../components/FichaGrid';
import { FichaPanel } from '../components/FichaPanel';
import { Icon, type IconName } from '../components/Icons';
import { PageHeader, ProgressSummary } from '../components/ui';

type Filtro = 'todos' | Estado;
const FILTROS: Array<[Filtro, string]> = [['todos', 'Todos'], ['sin_empezar', 'Sin empezar'], ['en_curso', 'En curso'], ['terminado', 'Terminados']];

export function FichasPage({ kind, title, icon, color, nuevo }: { kind: FichaKind; title: string; icon: IconName; color: string; nuevo: string }) {
  const { data, run } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const todas = fichasDe(data, kind);
  const visibles = filtro === 'todos' ? todas : todas.filter((f) => f.estado === filtro);
  const ficha = todas.find((f) => f.id === selected);

  const crear = () => {
    const id = newId();
    run((d) => uc.crearFicha(d, kind, id).data);
    setFiltro('todos');
    setSelected(id);
  };

  return (
    <div className={`with-panel ${ficha ? 'has-panel' : ''}`}>
      <div className="page">
        <PageHeader icon={icon} color={color} title={title}>
          <button className="btn primary" onClick={crear}><Icon name="plus" size={16} strokeWidth={2.2} />{nuevo}</button>
        </PageHeader>
        <ProgressSummary p={progresoFichas(todas)} />
        <div className="pills">
          {FILTROS.map(([v, l]) => (
            <button key={v} className={`pill ${filtro === v ? 'is-on' : ''}`} onClick={() => setFiltro(v)}>{l}</button>
          ))}
        </div>
        <FichaGrid fichas={visibles} color={color} selectedId={selected ?? undefined} onSelect={setSelected} />
      </div>
      {ficha && <FichaPanel key={ficha.id} ficha={ficha} color={color} onClose={() => setSelected(null)} />}
    </div>
  );
}
