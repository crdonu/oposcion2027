import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from './Icons';

const NAV: Array<{ to: string; label: string; icon: IconName; color: string }> = [
  { to: '/planificacion', label: 'Planificación', icon: 'plan', color: 'var(--c-plan)' },
  { to: '/temario', label: 'Temario', icon: 'tema', color: 'var(--c-tema)' },
  { to: '/casos', label: 'Casos prácticos', icon: 'caso', color: 'var(--c-caso)' },
  { to: '/programacion', label: 'Programación', icon: 'programacion', color: 'var(--c-prog)' },
  { to: '/convocatoria', label: 'Convocatoria', icon: 'convocatoria', color: 'var(--c-otro)' },
];

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = NAV.find((n) => location.pathname.startsWith(n.to))?.label ?? 'Ajustes';

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon-btn" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <Icon name="menu" size={20} />
        </button>
        <span className="topbar-title">{current}</span>
      </header>
      <nav className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Menú">
        <span className="brand">Oposición 2027</span>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className="nav-link" onClick={() => setOpen(false)}>
            <Icon name={n.icon} color={n.color} />{n.label}
          </NavLink>
        ))}
        <span className="grow" />
        <NavLink to="/ajustes" className="nav-link nav-muted" onClick={() => setOpen(false)}>
          <Icon name="ajustes" />Ajustes
        </NavLink>
      </nav>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main className="content">{children}</main>
    </div>
  );
}
