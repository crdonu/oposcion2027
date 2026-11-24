// Piezas pequeñas reutilizables.
import type { ReactNode } from 'react';
import { ESTADO_LABEL, type Estado } from '../../domain/entities';
import type { Progreso } from '../../domain/rules';
import { Icon } from './Icons';

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" className={`check ${checked ? 'is-on' : ''}`} aria-pressed={checked} aria-label={label}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}>
      <span className="check-box">{checked && <Icon name="check" size={12} strokeWidth={3.4} color="#fff" />}</span>
    </button>
  );
}

export function EstadoChip({ estado }: { estado: Estado }) {
  return <span className={`chip chip-${estado}`}>{ESTADO_LABEL[estado]}</span>;
}

export function ProgressBar({ value, total, secondary = 0, height = 6 }: { value: number; total: number; secondary?: number; height?: number }) {
  const pct = total ? (value / total) * 100 : 0;
  const pct2 = total ? (secondary / total) * 100 : 0;
  return (
    <span className="bar" style={{ height }} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
      <span className="bar-fill" style={{ width: `${pct}%` }} />
      {secondary > 0 && <span className="bar-fill2" style={{ width: `${pct2}%` }} />}
    </span>
  );
}

export function ProgressSummary({ p, labels }: { p: Progreso; labels?: [string, string, string] }) {
  const [a, b, c] = labels ?? ['Terminados', 'En curso', 'Sin empezar'];
  return (
    <div className="progress-summary">
      <ProgressBar value={p.terminado} secondary={p.en_curso} total={p.total} height={8} />
      <div className="legend">
        <span><i className="dot dot-done" />{a} {p.terminado}</span>
        <span><i className="dot dot-doing" />{b} {p.en_curso}</span>
        <span><i className="dot dot-todo" />{c} {p.sin_empezar}</span>
      </div>
    </div>
  );
}

export function PageHeader({ icon, color, title, children }: { icon: Parameters<typeof Icon>[0]['name']; color: string; title: string; children?: ReactNode }) {
  return (
    <div className="page-header">
      <h1><Icon name={icon} size={26} color={color} />{title}</h1>
      <div className="page-actions">{children}</div>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: Array<[T, string]>; onChange: (v: T) => void }) {
  return (
    <div className="segmented" role="tablist">
      {options.map(([v, label]) => (
        <button key={v} role="tab" aria-selected={v === value} className={v === value ? 'is-on' : ''} onClick={() => onChange(v)}>{label}</button>
      ))}
    </div>
  );
}
