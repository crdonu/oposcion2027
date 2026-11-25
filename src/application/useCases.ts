// Casos de uso: transformaciones puras de AppData. No saben nada de React ni del almacenamiento.
import type {
  AppData, Ajustes, Enlace, Estado, Ficha, FichaKind, Nota, Paso, Requisito, RequisitoGrupo,
  SeccionConvocatoria, Tarea,
} from '../domain/entities';
import { newId } from './ids';

type Patch<T> = Partial<Omit<T, 'id'>>;

const mapFicha = (d: AppData, id: string, fn: (f: Ficha) => Ficha): AppData => ({
  ...d,
  fichas: d.fichas.map((f) => (f.id === id ? fn(f) : f)),
});

// ---------- Fichas ----------

export function crearFicha(d: AppData, kind: FichaKind, id: string = newId()): { data: AppData; id: string } {
  const delKind = d.fichas.filter((f) => f.kind === kind);
  const numero = delKind.reduce((m, f) => Math.max(m, f.numero), 0) + 1;
  const orden = delKind.reduce((m, f) => Math.max(m, f.orden), 0) + 1;
  const ficha: Ficha = { id, kind, numero, titulo: '', estado: 'sin_empezar', orden, pasos: [], enlaces: [], notas: [] };
  return { data: { ...d, fichas: [...d.fichas, ficha] }, id: ficha.id };
}

export function editarFicha(d: AppData, id: string, patch: Patch<Ficha>): AppData {
  return mapFicha(d, id, (f) => ({ ...f, ...patch }));
}

export function cambiarEstado(d: AppData, id: string, estado: Estado): AppData {
  return editarFicha(d, id, { estado });
}

export function borrarFicha(d: AppData, id: string): AppData {
  return {
    ...d,
    fichas: d.fichas.filter((f) => f.id !== id),
    tareas: d.tareas.map((t) => (t.fichaId === id ? { ...t, fichaId: undefined } : t)),
  };
}

/** Mueve una ficha una posición antes (-1) o después (+1) dentro de su tipo. */
export function moverFicha(d: AppData, id: string, dir: -1 | 1): AppData {
  const f = d.fichas.find((x) => x.id === id);
  if (!f) return d;
  const lista = d.fichas.filter((x) => x.kind === f.kind).sort((a, b) => a.orden - b.orden);
  const i = lista.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= lista.length) return d;
  const other = lista[j];
  return {
    ...d,
    fichas: d.fichas.map((x) => (x.id === f.id ? { ...x, orden: other.orden } : x.id === other.id ? { ...x, orden: f.orden } : x)),
  };
}

// Pasos
export function anadirPaso(d: AppData, fichaId: string, texto: string): AppData {
  const paso: Paso = { id: newId(), texto, hecho: false };
  return mapFicha(d, fichaId, (f) => ({ ...f, pasos: [...f.pasos, paso] }));
}
export function editarPaso(d: AppData, fichaId: string, pasoId: string, patch: Patch<Paso>): AppData {
  return mapFicha(d, fichaId, (f) => ({ ...f, pasos: f.pasos.map((p) => (p.id === pasoId ? { ...p, ...patch } : p)) }));
}
export function borrarPaso(d: AppData, fichaId: string, pasoId: string): AppData {
  return mapFicha(d, fichaId, (f) => ({ ...f, pasos: f.pasos.filter((p) => p.id !== pasoId) }));
}

// Enlaces
export function anadirEnlace(d: AppData, fichaId: string, titulo: string, url: string): AppData {
  const e: Enlace = { id: newId(), titulo, url };
  return mapFicha(d, fichaId, (f) => ({ ...f, enlaces: [...f.enlaces, e] }));
}
export function borrarEnlace(d: AppData, fichaId: string, enlaceId: string): AppData {
  return mapFicha(d, fichaId, (f) => ({ ...f, enlaces: f.enlaces.filter((e) => e.id !== enlaceId) }));
}

// Notas
export function anadirNota(d: AppData, fichaId: string, texto: string): AppData {
  const n: Nota = { id: newId(), texto, creada: new Date().toISOString() };
  return mapFicha(d, fichaId, (f) => ({ ...f, notas: [...f.notas, n] }));
}
export function editarNota(d: AppData, fichaId: string, notaId: string, texto: string): AppData {
  return mapFicha(d, fichaId, (f) => ({
    ...f,
    notas: f.notas.map((n) => (n.id === notaId ? { ...n, texto, editada: new Date().toISOString() } : n)),
  }));
}
export function borrarNota(d: AppData, fichaId: string, notaId: string): AppData {
  return mapFicha(d, fichaId, (f) => ({ ...f, notas: f.notas.filter((n) => n.id !== notaId) }));
}

// ---------- Tareas ----------

export function crearTarea(d: AppData, t: Omit<Tarea, 'id'>): AppData {
  return { ...d, tareas: [...d.tareas, { ...t, id: newId() }] };
}
export function editarTarea(d: AppData, id: string, patch: Patch<Tarea>): AppData {
  return { ...d, tareas: d.tareas.map((t) => (t.id === id ? { ...t, ...patch } : t)) };
}
export function borrarTarea(d: AppData, id: string): AppData {
  return { ...d, tareas: d.tareas.filter((t) => t.id !== id) };
}

// ---------- Requisitos ----------

export function anadirRequisito(d: AppData, grupo: RequisitoGrupo, texto: string): AppData {
  const orden = d.requisitos.filter((r) => r.grupo === grupo).reduce((m, r) => Math.max(m, r.orden), 0) + 1;
  const r: Requisito = { id: newId(), grupo, texto, cumplido: false, orden };
  return { ...d, requisitos: [...d.requisitos, r] };
}
export function editarRequisito(d: AppData, id: string, patch: Patch<Requisito>): AppData {
  return { ...d, requisitos: d.requisitos.map((r) => (r.id === id ? { ...r, ...patch } : r)) };
}
export function borrarRequisito(d: AppData, id: string): AppData {
  return { ...d, requisitos: d.requisitos.filter((r) => r.id !== id) };
}

// ---------- Convocatoria ----------

export function anadirSeccion(d: AppData): AppData {
  const orden = d.convocatoria.reduce((m, s) => Math.max(m, s.orden), 0) + 1;
  const s: SeccionConvocatoria = { id: newId(), titulo: 'Nueva sección', texto: '', orden };
  return { ...d, convocatoria: [...d.convocatoria, s] };
}
export function editarSeccion(d: AppData, id: string, patch: Patch<SeccionConvocatoria>): AppData {
  return { ...d, convocatoria: d.convocatoria.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
}
export function borrarSeccion(d: AppData, id: string): AppData {
  return { ...d, convocatoria: d.convocatoria.filter((s) => s.id !== id) };
}

// ---------- Ajustes ----------

export function editarAjustes(d: AppData, patch: Partial<Ajustes>): AppData {
  return { ...d, ajustes: { ...d.ajustes, ...patch } };
}

// ---------- Importar / exportar ----------

export function validarAppData(x: unknown): x is AppData {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return o.version === 1 && Array.isArray(o.fichas) && Array.isArray(o.tareas) && Array.isArray(o.requisitos)
    && Array.isArray(o.convocatoria) && typeof o.ajustes === 'object';
}
