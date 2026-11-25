// Menú discreto «⋯»: las opciones solo aparecen al pulsarlo.
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';

export interface OpcionMenu { label: string; onClick: () => void; danger?: boolean }

export function MenuMas({ opciones, label = 'Más opciones' }: { opciones: OpcionMenu[]; label?: string }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setAbierto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', cerrar);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', cerrar); document.removeEventListener('keydown', esc); };
  }, [abierto]);

  return (
    <span className="menu-mas" ref={ref}>
      <button type="button" className="icon-btn subtle" aria-label={label} aria-haspopup="menu" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        <Icon name="more" size={18} strokeWidth={3} />
      </button>
      {abierto && (
        <span className="menu-pop" role="menu">
          {opciones.map((o) => (
            <button key={o.label} type="button" role="menuitem" className={`menu-item ${o.danger ? 'is-danger' : ''}`}
              onClick={() => { setAbierto(false); o.onClick(); }}>{o.label}</button>
          ))}
        </span>
      )}
    </span>
  );
}
