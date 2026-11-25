/* eslint-disable react-refresh/only-export-components */
// Formato de las notas: texto plano con dos marcas sencillas, fácil de leer
// también fuera de la app (copia de seguridad, Claude):
//   **texto**   → negrita
//   - texto     → viñeta (al principio de la línea)
// Las notas antiguas, sin marcas, se ven igual que antes.
import type { JSONContent } from '@tiptap/react';
import { Fragment, type ReactNode } from 'react';

type Bloque = { tipo: 'parrafo'; texto: string } | { tipo: 'lista'; items: string[] };

function bloques(texto: string): Bloque[] {
  const out: Bloque[] = [];
  for (const linea of texto.split('\n')) {
    const m = /^\s*[-•]\s+(.*)$/.exec(linea);
    if (m) {
      const last = out[out.length - 1];
      if (last?.tipo === 'lista') last.items.push(m[1]);
      else out.push({ tipo: 'lista', items: [m[1]] });
    } else {
      out.push({ tipo: 'parrafo', texto: linea });
    }
  }
  return out;
}

/** Trozos de una línea: [texto, negrita]. */
function trozos(linea: string): Array<[string, boolean]> {
  return linea.split(/(\*\*[^*]+?\*\*)/g).filter(Boolean).map((t) =>
    t.startsWith('**') && t.endsWith('**') && t.length > 4 ? [t.slice(2, -2), true] : [t, false]);
}

function inline(linea: string): ReactNode {
  return trozos(linea).map(([t, b], i) => (b ? <strong key={i}>{t}</strong> : <Fragment key={i}>{t}</Fragment>));
}

/** Muestra una nota guardada con su formato. */
export function NotaRender({ texto }: { texto: string }) {
  return (
    <div className="nota-text">
      {bloques(texto).map((b, i) =>
        b.tipo === 'lista'
          ? <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>
          : <p key={i}>{b.texto ? inline(b.texto) : ' '}</p>)}
    </div>
  );
}

// ---------- Conversión con el editor ----------

function inlineJson(linea: string): JSONContent[] {
  return trozos(linea).map(([text, bold]) => (bold ? { type: 'text', text, marks: [{ type: 'bold' }] } : { type: 'text', text }));
}

export function textoAJson(texto: string): JSONContent {
  const content: JSONContent[] = bloques(texto).map((b) =>
    b.tipo === 'lista'
      ? { type: 'bulletList', content: b.items.map((it) => ({ type: 'listItem', content: [{ type: 'paragraph', content: inlineJson(it) }] })) }
      : { type: 'paragraph', content: b.texto ? inlineJson(b.texto) : undefined });
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

function inlineTexto(nodes: JSONContent[] = []): string {
  return nodes.map((n) => {
    if (n.type === 'hardBreak') return ' ';
    const t = n.text ?? '';
    return n.marks?.some((m) => m.type === 'bold') && t.trim() ? `**${t}**` : t;
  }).join('');
}

export function jsonATexto(doc: JSONContent): string {
  const lineas: string[] = [];
  for (const n of doc.content ?? []) {
    if (n.type === 'bulletList') {
      for (const li of n.content ?? []) {
        const partes = (li.content ?? []).map((p) => inlineTexto(p.content)).filter((t) => t.length);
        lineas.push(`- ${partes.join(' ')}`);
      }
    } else {
      lineas.push(inlineTexto(n.content));
    }
  }
  while (lineas.length && !lineas[lineas.length - 1].trim()) lineas.pop();
  return lineas.join('\n');
}
