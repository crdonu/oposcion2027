// Casos de uso: transformaciones puras de AppData. No saben nada de React ni del almacenamiento.
import type {
  AppData, Ajustes, DocumentoConsulta, Enlace, Estado, Ficha, FichaKind, Nota, PaginaNormativa, Paso, Requisito, RequisitoGrupo,
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
export function anadirEnlace(d: AppData, fichaId: string, titulo: string, url: string, mostrar = false): AppData {
  const e: Enlace = { id: newId(), titulo, url, ...(mostrar ? { mostrar: true } : {}) };
  return mapFicha(d, fichaId, (f) => ({ ...f, enlaces: [...f.enlaces, e] }));
}
export function editarEnlace(d: AppData, fichaId: string, enlaceId: string, patch: Patch<Enlace>): AppData {
  return mapFicha(d, fichaId, (f) => ({ ...f, enlaces: f.enlaces.map((e) => (e.id === enlaceId ? { ...e, ...patch } : e)) }));
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

// ---------- Normativa ----------

const mapPagina = (d: AppData, id: string, fn: (p: PaginaNormativa) => PaginaNormativa): AppData => ({
  ...d,
  normativa: d.normativa.map((p) => (p.id === id ? fn(p) : p)),
});

export function crearPagina(d: AppData, id: string = newId()): AppData {
  const orden = d.normativa.reduce((m, p) => Math.max(m, p.orden), 0) + 1;
  const p: PaginaNormativa = { id, titulo: '', texto: '', enlaces: [], orden, creada: new Date().toISOString() };
  return { ...d, normativa: [...d.normativa, p] };
}
export function editarPagina(d: AppData, id: string, patch: Patch<PaginaNormativa>): AppData {
  return mapPagina(d, id, (p) => ({ ...p, ...patch }));
}
export function borrarPagina(d: AppData, id: string): AppData {
  return { ...d, normativa: d.normativa.filter((p) => p.id !== id) };
}
export function moverPagina(d: AppData, id: string, dir: -1 | 1): AppData {
  const lista = [...d.normativa].sort((a, b) => a.orden - b.orden);
  const i = lista.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= lista.length) return d;
  const a = lista[i], b = lista[j];
  return { ...d, normativa: d.normativa.map((p) => (p.id === a.id ? { ...p, orden: b.orden } : p.id === b.id ? { ...p, orden: a.orden } : p)) };
}
export function anadirEnlacePagina(d: AppData, id: string, titulo: string, url: string, mostrar = false): AppData {
  const e: Enlace = { id: newId(), titulo, url, ...(mostrar ? { mostrar: true } : {}) };
  return mapPagina(d, id, (p) => ({ ...p, enlaces: [...p.enlaces, e] }));
}
export function editarEnlacePagina(d: AppData, id: string, enlaceId: string, patch: Patch<Enlace>): AppData {
  return mapPagina(d, id, (p) => ({ ...p, enlaces: p.enlaces.map((e) => (e.id === enlaceId ? { ...e, ...patch } : e)) }));
}
export function borrarEnlacePagina(d: AppData, id: string, enlaceId: string): AppData {
  return mapPagina(d, id, (p) => ({ ...p, enlaces: p.enlaces.filter((e) => e.id !== enlaceId) }));
}

// ---------- Documentos de consulta (Programación) ----------

export function anadirDocumento(d: AppData, doc: Omit<DocumentoConsulta, 'id' | 'orden'>): AppData {
  const orden = d.documentos.reduce((m, x) => Math.max(m, x.orden), 0) + 1;
  return { ...d, documentos: [...d.documentos, { ...doc, id: newId(), orden }] };
}
export function editarDocumento(d: AppData, id: string, patch: Patch<DocumentoConsulta>): AppData {
  return { ...d, documentos: d.documentos.map((x) => (x.id === id ? { ...x, ...patch } : x)) };
}
export function borrarDocumento(d: AppData, id: string): AppData {
  return { ...d, documentos: d.documentos.filter((x) => x.id !== id) };
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

/** Completa datos guardados con versiones anteriores de la app (campos nuevos vacíos). */
export function migrar(d: AppData): AppData {
  return {
    ...d,
    normativa: Array.isArray(d.normativa) ? d.normativa : [],
    documentos: Array.isArray(d.documentos) ? d.documentos : [],
  };
}

export function validarAppData(x: unknown): x is AppData {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return o.version === 1 && Array.isArray(o.fichas) && Array.isArray(o.tareas) && Array.isArray(o.requisitos)
    && Array.isArray(o.convocatoria) && typeof o.ajustes === 'object';
}
