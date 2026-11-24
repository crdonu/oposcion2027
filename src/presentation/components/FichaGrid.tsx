import { FICHA_PREFIX, type Ficha } from '../../domain/entities';
import { EstadoChip } from './ui';

export function FichaGrid({ fichas, color, selectedId, onSelect, cols = 'grid-cards', showPrefix = true }: {
  fichas: Ficha[]; color: string; selectedId?: string; onSelect: (id: string) => void; cols?: string; showPrefix?: boolean;
}) {
  if (!fichas.length) return <p className="muted empty">No hay nada aquí todavía.</p>;
  return (
    <div className={cols}>
      {fichas.map((f) => (
        <button key={f.id} className={`card ${f.id === selectedId ? 'is-selected' : ''}`} onClick={() => onSelect(f.id)}>
          <span className="card-text">
            <span className="card-kicker" style={{ color }}>{showPrefix ? `${FICHA_PREFIX[f.kind]} ${f.numero}` : `${f.numero}.`}</span>
            <span className={`card-title ${f.titulo ? '' : 'is-empty'}`}>{f.titulo || 'Sin título'}</span>
          </span>
          <EstadoChip estado={f.estado} />
        </button>
      ))}
    </div>
  );
}
