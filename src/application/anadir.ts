// Añadir desde un archivo: suma contenido a los datos sin borrar ni cambiar nada.
// Formato del archivo (JSON), todo opcional salvo "tipo":
// {
//   "tipo": "oposicion-anadir",
//   "fichas": [ { "kind": "apartado", "numero": 5,
//                 "pasos": ["…"], "notas": ["…"], "enlaces": [{ "titulo": "…", "url": "https://…" }] } ],
//   "tareas": [ { "titulo": "…", "fecha": "2026-11-30", "tipo": "programacion",
//                 "ficha": { "kind": "apartado", "numero": 5 } } ],
//   "requisitos": [ { "grupo": "contenido", "texto": "…" } ]
// }
import type { AppData, Ficha, FichaKind, RequisitoGrupo, TareaTipo } from '../domain/entities';
import { etiquetaFicha } from '../domain/rules';
import * as uc from './useCases';

export const TIPO_ARCHIVO = 'oposicion-anadir';

const KINDS: FichaKind[] = ['tema', 'caso', 'apartado', 'unidad'];
const TIPOS: TareaTipo[] = ['tema', 'caso', 'programacion', 'otro'];
const KIND_A_TIPO: Record<FichaKind, TareaTipo> = { tema: 'tema', caso: 'caso', apartado: 'programacion', unidad: 'programacion' };

interface RefFicha { kind: FichaKind; numero: number }
interface FichaAdicion extends RefFicha { pasos: string[]; notas: string[]; enlaces: Array<{ titulo: string; url: string }> }
interface TareaAdicion { titulo: string; fecha: string; tipo?: TareaTipo; ficha?: RefFicha }
interface RequisitoAdicion { grupo: RequisitoGrupo; texto: string }

export interface Adicion {
  fichas: FichaAdicion[];
  tareas: TareaAdicion[];
  requisitos: RequisitoAdicion[];
}

export interface LineaPlan { donde: string; que: string; kind?: FichaKind | 'plan' | 'req' }
export interface PlanAdicion {
  lineas: LineaPlan[];
  repetidos: number;
  avisos: string[];
  total: number;
}

// ---------- Lectura y validación ----------

const str = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null);
const strList = (x: unknown): string[] => (Array.isArray(x) ? x.map(str).filter((s): s is string => s !== null) : []);

function refFicha(x: unknown): RefFicha | null {
  if (!x || typeof x !== 'object') return null;
  const o = x as Record<string, unknown>;
  const kind = o.kind as FichaKind;
  const numero = Number(o.numero);
  return KINDS.includes(kind) && Number.isInteger(numero) && numero > 0 ? { kind, numero } : null;
}

function normalizaUrl(u: string): string {
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

/** Convierte el contenido del archivo en una Adicion, o devuelve un error legible. */
export function leerAdicion(raw: unknown): { ok: true; adicion: Adicion } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'El archivo no tiene el formato para añadir.' };
  const o = raw as Record<string, unknown>;
  if (o.tipo !== TIPO_ARCHIVO) {
    if (uc.validarAppData(raw)) return { ok: false, error: 'Este archivo es una copia completa. Para cargarlo usa «Restaurar copia completa».' };
    return { ok: false, error: 'El archivo no tiene el formato para añadir (falta "tipo": "oposicion-anadir").' };
  }
  const fichas: FichaAdicion[] = [];
  for (const f of Array.isArray(o.fichas) ? o.fichas : []) {
    const ref = refFicha(f);
    if (!ref) continue;
    const r = f as Record<string, unknown>;
    const enlaces = (Array.isArray(r.enlaces) ? r.enlaces : [])
      .map((e) => (e && typeof e === 'object' ? e as Record<string, unknown> : {}))
      .map((e) => ({ url: str(e.url), titulo: str(e.titulo) }))
      .filter((e): e is { url: string; titulo: string | null } => e.url !== null)
      .map((e) => ({ url: normalizaUrl(e.url), titulo: e.titulo ?? e.url }));
    fichas.push({ ...ref, pasos: strList(r.pasos), notas: strList(r.notas), enlaces });
  }
  const tareas: TareaAdicion[] = [];
  for (const t of Array.isArray(o.tareas) ? o.tareas : []) {
    if (!t || typeof t !== 'object') continue;
    const r = t as Record<string, unknown>;
    const titulo = str(r.titulo);
    const fecha = str(r.fecha);
    if (!titulo || !fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) continue;
    const tipo = TIPOS.includes(r.tipo as TareaTipo) ? (r.tipo as TareaTipo) : undefined;
    tareas.push({ titulo, fecha, tipo, ficha: refFicha(r.ficha) ?? undefined });
  }
  const requisitos: RequisitoAdicion[] = [];
  for (const q of Array.isArray(o.requisitos) ? o.requisitos : []) {
    if (!q || typeof q !== 'object') continue;
    const r = q as Record<string, unknown>;
    const texto = str(r.texto);
    if (texto && (r.grupo === 'contenido' || r.grupo === 'formato')) requisitos.push({ grupo: r.grupo, texto });
  }
  return { ok: true, adicion: { fichas, tareas, requisitos } };
}

// ---------- Plan (vista previa) y aplicación ----------

const igual = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const buscar = (d: AppData, r: RefFicha): Ficha | undefined => d.fichas.find((f) => f.kind === r.kind && f.numero === r.numero);
const nombre = (r: RefFicha, f?: Ficha) => {
  if (!f) return `${r.kind} ${r.numero}`;
  if (!f.titulo) return etiquetaFicha(f);
  return f.kind === 'apartado' ? `${f.numero}. ${f.titulo}` : `${etiquetaFicha(f)} · ${f.titulo}`;
};
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** Recorre la adición sobre los datos: qué se añadiría, qué se repetiría y qué no encaja. */
function recorrer(d: AppData, a: Adicion, aplicar: boolean): { data: AppData; plan: PlanAdicion } {
  let data = d;
  const lineas: LineaPlan[] = [];
  const avisos: string[] = [];
  let repetidos = 0;
  let total = 0;

  for (const fa of a.fichas) {
    const f = buscar(data, fa);
    if (!f) { avisos.push(`No existe ${FICHA_NOMBRE[fa.kind]} ${fa.numero}: se ignora.`); continue; }
    const pasos = fa.pasos.filter((p, i, arr) => !f.pasos.some((x) => igual(x.texto, p)) && arr.findIndex((y) => igual(y, p)) === i);
    const notas = fa.notas.filter((n, i, arr) => !f.notas.some((x) => igual(x.texto, n)) && arr.findIndex((y) => igual(y, n)) === i);
    const enlaces = fa.enlaces.filter((e, i, arr) => !f.enlaces.some((x) => x.url === e.url) && arr.findIndex((y) => y.url === e.url) === i);
    repetidos += fa.pasos.length + fa.notas.length + fa.enlaces.length - pasos.length - notas.length - enlaces.length;
    const partes = [
      pasos.length ? plural(pasos.length, 'paso nuevo', 'pasos nuevos') : '',
      notas.length ? plural(notas.length, 'nota nueva', 'notas nuevas') : '',
      enlaces.length ? plural(enlaces.length, 'enlace nuevo', 'enlaces nuevos') : '',
    ].filter(Boolean);
    if (!partes.length) continue;
    total += pasos.length + notas.length + enlaces.length;
    lineas.push({ donde: nombre(fa, f), que: partes.join(', '), kind: f.kind });
    if (aplicar) {
      for (const p of pasos) data = uc.anadirPaso(data, f.id, p);
      for (const n of notas) data = uc.anadirNota(data, f.id, n);
      for (const e of enlaces) data = uc.anadirEnlace(data, f.id, e.titulo, e.url);
    }
  }

  const tareasNuevas: string[] = [];
  for (const ta of a.tareas) {
    const f = ta.ficha ? buscar(data, ta.ficha) : undefined;
    if (ta.ficha && !f) avisos.push(`La tarea «${ta.titulo}» menciona ${FICHA_NOMBRE[ta.ficha.kind]} ${ta.ficha.numero}, que no existe: se añade sin relacionar.`);
    if (data.tareas.some((t) => t.fecha === ta.fecha && igual(t.titulo, ta.titulo))) { repetidos += 1; continue; }
    total += 1;
    tareasNuevas.push(`${ta.titulo} (${ta.fecha.split('-').reverse().slice(0, 2).join('/')})`);
    if (aplicar) {
      data = uc.crearTarea(data, { titulo: ta.titulo, fecha: ta.fecha, hecha: false, tipo: ta.tipo ?? (f ? KIND_A_TIPO[f.kind] : 'otro'), fichaId: f?.id });
    }
  }
  if (tareasNuevas.length) lineas.push({ donde: 'Planificación', que: `${plural(tareasNuevas.length, 'tarea', 'tareas')}: ${tareasNuevas.join('; ')}`, kind: 'plan' });

  for (const grupo of ['contenido', 'formato'] as const) {
    const nuevos = a.requisitos.filter((r) => r.grupo === grupo)
      .filter((r, i, arr) => !data.requisitos.some((x) => x.grupo === grupo && igual(x.texto, r.texto)) && arr.findIndex((y) => igual(y.texto, r.texto)) === i);
    repetidos += a.requisitos.filter((r) => r.grupo === grupo).length - nuevos.length;
    if (!nuevos.length) continue;
    total += nuevos.length;
    lineas.push({ donde: `Requisitos de ${grupo}`, que: plural(nuevos.length, 'requisito nuevo', 'requisitos nuevos'), kind: 'req' });
    if (aplicar) for (const r of nuevos) data = uc.anadirRequisito(data, grupo, r.texto);
  }

  return { data, plan: { lineas, repetidos, avisos, total } };
}

const FICHA_NOMBRE: Record<FichaKind, string> = { tema: 'el tema', caso: 'el caso', apartado: 'el apartado', unidad: 'la unidad' };

export function planAdicion(d: AppData, a: Adicion): PlanAdicion {
  return recorrer(d, a, false).plan;
}

export function aplicarAdicion(d: AppData, a: Adicion): AppData {
  return recorrer(d, a, true).data;
}
