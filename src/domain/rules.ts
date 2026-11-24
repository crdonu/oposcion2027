// Reglas de negocio puras: progreso, atrasos, ritmo de estudio.
import type { AppData, Estado, Ficha, FichaKind, Tarea } from './entities';
import { startOfWeek, weeksBetween } from './dates';

export interface Progreso {
  total: number;
  terminado: number;
  en_curso: number;
  sin_empezar: number;
}

export function progresoFichas(fichas: Ficha[]): Progreso {
  const p: Progreso = { total: fichas.length, terminado: 0, en_curso: 0, sin_empezar: 0 };
  for (const f of fichas) p[f.estado as Estado] += 1;
  return p;
}

export function progresoPasos(f: Ficha): { hechos: number; total: number } {
  return { hechos: f.pasos.filter((p) => p.hecho).length, total: f.pasos.length };
}

export function fichasDe(data: AppData, kind: FichaKind): Ficha[] {
  return data.fichas.filter((f) => f.kind === kind).sort((a, b) => a.orden - b.orden);
}

export function tareasAtrasadas(tareas: Tarea[], hoy: string): Tarea[] {
  return tareas.filter((t) => !t.hecha && t.fecha < hoy).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function tareasDelDia(tareas: Tarea[], fecha: string): Tarea[] {
  return tareas.filter((t) => t.fecha === fecha);
}

export function tareasDeSemana(tareas: Tarea[], monday: string): Tarea[] {
  return tareas.filter((t) => startOfWeek(t.fecha) === monday);
}

export interface Ritmo {
  semanasEstudio: number;
  temasPendientes: number;
  temasTotales: number;
  porSemana: number; // puede ser decimal
  temasSinSemana: number;
}

/** Cuántos temas por semana hacen falta para terminar antes de `finEstudio`. */
export function ritmoEstudio(data: AppData, hoy: string): Ritmo {
  const temas = fichasDe(data, 'tema');
  const pendientes = temas.filter((t) => t.estado !== 'terminado');
  const semanas = hoy <= data.ajustes.finEstudio ? weeksBetween(hoy, data.ajustes.finEstudio).length : 0;
  const conTarea = new Set(data.tareas.filter((t) => t.fichaId).map((t) => t.fichaId));
  return {
    semanasEstudio: semanas,
    temasPendientes: pendientes.length,
    temasTotales: temas.length,
    porSemana: semanas > 0 ? pendientes.length / semanas : pendientes.length,
    temasSinSemana: pendientes.filter((t) => !conTarea.has(t.id)).length,
  };
}

export function etiquetaFicha(f: Ficha): string {
  const prefix = { tema: 'Tema', caso: 'Caso', apartado: '', unidad: 'Unidad' }[f.kind];
  return prefix ? `${prefix} ${f.numero}` : `${f.numero}.`;
}
