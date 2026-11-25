// Datos con los que arranca la aplicación la primera vez.
import type { AppData, Ficha, FichaKind, Requisito, RequisitoGrupo, SeccionConvocatoria } from '../domain/entities';
import { newId } from './ids';

function fichas(kind: FichaKind, titulos: string[]): Ficha[] {
  return titulos.map((titulo, i) => ({
    id: newId(), kind, numero: i + 1, titulo, estado: 'sin_empezar', orden: i + 1, pasos: [], enlaces: [], notas: [],
  }));
}

const vacios = (n: number) => Array.from({ length: n }, () => '');

const APARTADOS = [
  'Introducción',
  'Fundamentación',
  'Contextualización',
  'Identificación del título y del módulo',
  'Elementos curriculares',
  'Unidades didácticas',
  'Metodología',
  'Formación en empresa (FP Dual)',
  'Evaluación',
  'Atención a la diversidad',
  'Evaluación de la propia práctica docente',
];

const PASOS_APARTADO: Record<number, string[]> = {
  4: ['Denominación', 'Código', 'Duración', 'Curso', 'Régimen dual'],
  8: ['Protocolos de renuncia'],
  10: ['Principio de diseño universal', 'Medidas generales', 'Medidas específicas', 'Adaptaciones de acceso'],
};

const CONTENIDO = [
  'Introducción',
  'Contexto del centro y del alumnado',
  'Curso y tipo de centro',
  'Módulo de FP de un título con atribución docente de Servicios a la Comunidad',
  'Nombre del módulo, duración y curso',
  'Objetivos generales del ciclo relacionados con el módulo',
  'Competencias',
  'Resultados de aprendizaje',
  'Criterios de evaluación ponderados',
  'Contenidos relacionados con los resultados de aprendizaje y los criterios, secuenciados',
  'Mínimo 12 unidades, numeradas en el índice',
  'Competencias y contenidos de cada unidad',
  'Actividades de enseñanza, aprendizaje y evaluación de cada unidad, con sus recursos',
  'Metodología',
  'Recursos y materiales',
  'TIC',
  'Instrumentos de evaluación, calificación y recuperación',
  'Criterios de calificación',
  'Actividades de refuerzo o recuperación',
  'Atención a la diversidad',
  'Adaptaciones de acceso, si proceden',
  'Principio de diseño universal',
  'Igualdad entre mujeres y hombres, prevención de la violencia de género y de la violencia contra la infancia y la adolescencia, y respeto a la diversidad sexual y de género',
  'Apartado de evaluación de la propia práctica docente',
  'Solo normativa vigente',
];

const FORMATO = [
  'Portada con datos de identificación y especialidad',
  'Índice',
  'Máximo 80 páginas con anexos (la portada no cuenta)',
  'DIN-A4, una cara',
  'Arial 12 sin comprimir',
  'Interlineado doble (sencillo en tablas)',
  'Márgenes de 2,54 cm',
  'Nombre y apellidos en todas las hojas',
  'Firma en la portada',
];

function requisitos(grupo: RequisitoGrupo, textos: string[]): Requisito[] {
  return textos.map((texto, i) => ({ id: newId(), grupo, texto, cumplido: false, orden: i + 1 }));
}

const CONVOCATORIA: Array<[string, string]> = [
  ['Primera prueba', 'Hay que sacar un 5 en total.\n• Caso práctico: 70 %, mínimo 2,5. Duración: la fija el tribunal.\n• Tema escrito: 30 %, mínimo 2,5. 2 horas. Se elige 1 de 3 temas sacados al azar.\n• Tema: estructura 1 punto, expresión 1, contenidos 8.'],
  ['Segunda prueba', 'Hay que sacar un 5.\n• Programación didáctica: 30 %.\n• Unidad didáctica: 70 %. Se sacan 3 al azar y se elige una.\n• 1 hora de preparación sin internet. Defensa de la programación hasta 20 min, unidad hasta 30 min, debate hasta 10 min. Guion de una cara.'],
  ['Nota final', 'Dos tercios la oposición y un tercio los méritos.'],
  ['Penalizaciones en lo escrito', '• Falta de ortografía: −0,25. Tilde: −0,15. Abreviaturas: −0,10. Sin límite.\n• Solo bolígrafo azul o negro, sin borrable ni corrector.\n• Cualquier marca identificativa: un 0.'],
  ['Fecha', 'Segunda quincena de junio de 2027 (previsto). Referencia: convocatoria de Madrid de 2025 (BOCM 28/02/2025).'],
];

function convocatoria(): SeccionConvocatoria[] {
  return CONVOCATORIA.map(([titulo, texto], i) => ({ id: newId(), titulo, texto, orden: i + 1 }));
}

export function crearDatosIniciales(): AppData {
  const apartados = fichas('apartado', APARTADOS).map((f) => ({
    ...f,
    pasos: (PASOS_APARTADO[f.numero] ?? []).map((texto) => ({ id: newId(), texto, hecho: false })),
  }));
  return {
    version: 1,
    fichas: [
      ...fichas('tema', vacios(35)),
      ...fichas('caso', vacios(10)),
      ...apartados,
      ...fichas('unidad', vacios(12)),
    ],
    normativa: [],
    documentos: [],
    tareas: [],
    requisitos: [...requisitos('contenido', CONTENIDO), ...requisitos('formato', FORMATO)],
    convocatoria: convocatoria(),
    ajustes: { tema: 'claro', finEstudio: '2027-05-16', fechaExamen: '2027-06-15' },
  };
}
