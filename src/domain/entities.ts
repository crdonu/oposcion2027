// Capa de dominio: tipos puros, sin dependencias de React ni del navegador.

export type Estado = 'sin_empezar' | 'en_curso' | 'terminado';

export const ESTADOS: Estado[] = ['sin_empezar', 'en_curso', 'terminado'];

export const ESTADO_LABEL: Record<Estado, string> = {
  sin_empezar: 'Sin empezar',
  en_curso: 'En curso',
  terminado: 'Terminado',
};

/** Tipos de ficha (tarjeta con su ficha de detalle). */
export type FichaKind = 'tema' | 'caso' | 'apartado' | 'unidad';

export const FICHA_PREFIX: Record<FichaKind, string> = {
  tema: 'Tema',
  caso: 'Caso',
  apartado: 'Apartado',
  unidad: 'Unidad',
};

export interface Paso {
  id: string;
  texto: string;
  hecho: boolean;
}

export interface Enlace {
  id: string;
  titulo: string;
  url: string;
  /** true: es un esquema o imagen y se muestra dentro de la página. */
  mostrar?: boolean;
}

export interface Nota {
  id: string;
  texto: string;
  creada: string; // ISO datetime
  editada?: string;
}

export interface Ficha {
  id: string;
  kind: FichaKind;
  numero: number;
  titulo: string;
  estado: Estado;
  orden: number;
  pasos: Paso[];
  enlaces: Enlace[];
  notas: Nota[];
}

/** Tipo de tarea del calendario. Determina su color. */
export type TareaTipo = 'tema' | 'caso' | 'programacion' | 'importante' | 'otro';

export const TAREA_TIPO_LABEL: Record<TareaTipo, string> = {
  tema: 'Tema',
  caso: 'Caso práctico',
  programacion: 'Programación',
  importante: 'Importante',
  otro: 'Otro',
};

export interface Tarea {
  id: string;
  titulo: string;
  tipo: TareaTipo;
  fecha: string; // YYYY-MM-DD
  hecha: boolean;
  fichaId?: string;
}

export type RequisitoGrupo = 'contenido' | 'formato';

export interface Requisito {
  id: string;
  grupo: RequisitoGrupo;
  texto: string;
  cumplido: boolean;
  orden: number;
}

export interface SeccionConvocatoria {
  id: string;
  titulo: string;
  texto: string;
  orden: number;
}

export interface Ajustes {
  tema: 'claro' | 'oscuro';
  /** Último día de estudio de contenido nuevo; después, repaso. */
  finEstudio: string; // YYYY-MM-DD
  /** Fecha aproximada del examen. */
  fechaExamen: string; // YYYY-MM-DD
}

/** Agregado raíz: todos los datos de la aplicación. */
/** Página de la sección Normativa: título, texto libre, esquemas y enlaces. */
export interface PaginaNormativa {
  id: string;
  titulo: string;
  texto: string; // mismo formato que las notas: **negrita** y "- " viñetas
  enlaces: Enlace[];
  orden: number;
  creada: string; // ISO datetime
}

/** Documento que se consulta para hacer la programación (instrucciones, orientaciones…). */
export interface DocumentoConsulta {
  id: string;
  titulo: string;
  url: string;
  explicacion: string;
  orden: number;
}

export interface AppData {
  version: 1;
  fichas: Ficha[];
  normativa: PaginaNormativa[];
  documentos: DocumentoConsulta[];
  tareas: Tarea[];
  requisitos: Requisito[];
  convocatoria: SeccionConvocatoria[];
  ajustes: Ajustes;
}
