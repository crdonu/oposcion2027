// Iconos de trazo, siempre el mismo icono para lo mismo.
const PATHS = {
  plan: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  tema: 'M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14',
  caso: 'M3 7h18v13H3zM9 7V4h6v3M3 12h18',
  programacion: 'M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M9 12h6M9 16h4',
  convocatoria: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  ajustes: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  expand: 'M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7',
  collapse: 'M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  check: 'M5 12l5 5 9-10',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  menu: 'M4 6h16M4 12h16M4 18h16',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }: {
  name: IconName; size?: number; color?: string; strokeWidth?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
