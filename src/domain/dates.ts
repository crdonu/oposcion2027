// Utilidades de fechas en hora local, con fechas en formato YYYY-MM-DD.

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(s: string, n: number): string {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Lunes de la semana de la fecha dada. */
export function startOfWeek(s: string): string {
  const d = parseISODate(s);
  const dow = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - dow);
  return toISODate(d);
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function startOfMonth(s: string): string {
  const d = parseISODate(s);
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function addMonths(s: string, n: number): string {
  const d = parseISODate(s);
  return toISODate(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

/** Celdas (semanas completas de lunes a domingo) que cubren el mes. */
export function monthGrid(monthStart: string): string[] {
  const first = startOfWeek(monthStart);
  const d = parseISODate(monthStart);
  const last = toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  const end = addDays(startOfWeek(last), 6);
  const days: string[] = [];
  for (let cur = first; cur <= end; cur = addDays(cur, 1)) days.push(cur);
  return days;
}

/** Lunes de cada semana desde `from` hasta `to` (incluidas). */
export function weeksBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let w = startOfWeek(from); w <= to; w = addDays(w, 7)) out.push(w);
  return out;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function monthName(s: string): string {
  const d = parseISODate(s);
  const n = MESES[d.getMonth()];
  return `${n[0].toUpperCase()}${n.slice(1)} ${d.getFullYear()}`;
}

export function monthKey(s: string): string {
  return s.slice(0, 7);
}

export function monthLabel(s: string): string {
  const n = MESES[parseISODate(s).getMonth()];
  return n[0].toUpperCase() + n.slice(1);
}

export function shortDate(s: string): string {
  const d = parseISODate(s);
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}

export function weekRangeLabel(monday: string): string {
  const a = parseISODate(monday);
  const b = parseISODate(addDays(monday, 6));
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${MESES[b.getMonth()]}`;
  return `${a.getDate()} ${MESES_CORTOS[a.getMonth()]} – ${b.getDate()} ${MESES_CORTOS[b.getMonth()]}`;
}

export function dayOfMonth(s: string): number {
  return parseISODate(s).getDate();
}
