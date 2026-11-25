// Planificación: vistas Semana (corto plazo), Mes (medio) y Hasta junio (largo).
import { useState, type DragEvent } from 'react';
import type { Tarea } from '../../domain/entities';
import {
  DIAS_CORTOS, addDays, parseISODate, addMonths, dayOfMonth, monthGrid, monthKey, monthLabel, monthName, shortDate,
  startOfMonth, startOfWeek, today, weekDays, weekRangeLabel, weeksBetween,
} from '../../domain/dates';
import { nombreFicha, fichasDe, ritmoEstudio, tareasAtrasadas, tareasDeSemana, tareasDelDia } from '../../domain/rules';
import * as uc from '../../application/useCases';
import { useStore } from '../state/AppStore';
import { Icon } from '../components/Icons';
import { Checkbox, PageHeader, Segmented } from '../components/ui';
import { TareaDialog, type TareaDraft } from '../components/TareaDialog';

type Vista = 'semana' | 'mes' | 'junio';

const nuevaTarea = (fecha: string): TareaDraft => ({ titulo: '', tipo: 'tema', fecha, hecha: false });

export function PlanificacionPage() {
  const { data, run } = useStore();
  const hoy = today();
  const [vista, setVista] = useState<Vista>(() => (sessionStorage.getItem('plan-vista') as Vista) || 'semana');
  const [semana, setSemana] = useState(startOfWeek(hoy));
  const [mes, setMes] = useState(startOfMonth(hoy));
  const [draft, setDraft] = useState<TareaDraft | null>(null);
  const atrasadas = tareasAtrasadas(data.tareas, hoy);

  const cambiarVista = (v: Vista) => {
    setVista(v);
    try { sessionStorage.setItem('plan-vista', v); } catch { /* nada */ }
  };

  return (
    <div className="page">
      <PageHeader icon="plan" color="var(--c-plan)" title="Planificación">
        <Segmented value={vista} onChange={cambiarVista} options={[['semana', 'Semana'], ['mes', 'Mes'], ['junio', 'Hasta junio']]} />
      </PageHeader>

      {atrasadas.length > 0 && vista !== 'junio' && (
        <div className="overdue">
          <span className="overdue-title"><Icon name="clock" size={16} />Atrasado · {atrasadas.length}</span>
          {atrasadas.map((t) => (
            <div key={t.id} className="overdue-row">
              <span className="grow">
                <span className={`tipo-txt tipo-${t.tipo}`}>{t.titulo}</span>
                <span className="small overdue-date"> · {shortDate(t.fecha)}</span>
              </span>
              <button className="btn small-btn" onClick={() => run((d) => uc.editarTarea(d, t.id, { fecha: hoy }))}>Pasar a hoy</button>
              <Checkbox checked={false} label="Marcar como hecha" onChange={() => run((d) => uc.editarTarea(d, t.id, { hecha: true }))} />
            </div>
          ))}
        </div>
      )}

      {vista === 'semana' && <VistaSemana monday={semana} setMonday={setSemana} hoy={hoy} onEdit={setDraft} />}
      {vista === 'mes' && <VistaMes mes={mes} setMes={setMes} hoy={hoy} onEdit={setDraft} />}
      {vista === 'junio' && <VistaJunio hoy={hoy} onEdit={setDraft} />}

      {draft && <TareaDialog draft={draft} onClose={() => setDraft(null)} />}
    </div>
  );
}

function NavFlechas({ label, onPrev, onNext, onToday, extra, onAdd }: { label: string; onPrev: () => void; onNext: () => void; onToday: () => void; extra?: string; onAdd: () => void }) {
  return (
    <div className="cal-nav">
      <button className="icon-btn bordered" aria-label="Anterior" onClick={onPrev}><Icon name="left" size={16} /></button>
      <button className="icon-btn bordered" aria-label="Siguiente" onClick={onNext}><Icon name="right" size={16} /></button>
      <span className="cal-label">{label}</span>
      {extra && <span className="muted small">· {extra}</span>}
      <span className="grow" />
      <button className="btn ghost" onClick={onToday}>Hoy</button>
      <button className="btn primary" onClick={onAdd}><Icon name="plus" size={15} strokeWidth={2.2} />Tarea</button>
    </div>
  );
}

function TareaCard({ t, onEdit }: { t: Tarea; onEdit: (d: TareaDraft) => void }) {
  const { run } = useStore();
  return (
    <div className={`task-card ${t.hecha ? 'is-done' : ''}`}>
      <Checkbox checked={t.hecha} label="Marcar como hecha" onChange={(v) => run((d) => uc.editarTarea(d, t.id, { hecha: v }))} />
      <button className={`task-text ${t.tipo === 'importante' ? 'tipo-importante-text' : ''}`} onClick={() => onEdit(t)}>
        <span className={`tipo-dot tipo-bg-${t.tipo}`} />
        {t.titulo}
      </button>
    </div>
  );
}

function VistaSemana({ monday, setMonday, hoy, onEdit }: { monday: string; setMonday: (s: string) => void; hoy: string; onEdit: (d: TareaDraft) => void }) {
  const { data, run } = useStore();
  const deSemana = tareasDeSemana(data.tareas, monday);
  const hechas = deSemana.filter((t) => t.hecha).length;
  const esEsta = monday === startOfWeek(hoy);

  const onDrop = (fecha: string) => (e: DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/tarea');
    if (id) run((d) => uc.editarTarea(d, id, { fecha }));
  };

  return (
    <>
      <NavFlechas label={`${esEsta ? 'Esta semana · ' : ''}${weekRangeLabel(monday)}`} extra={deSemana.length ? `${hechas} de ${deSemana.length} hechas` : undefined}
        onPrev={() => setMonday(addDays(monday, -7))} onNext={() => setMonday(addDays(monday, 7))} onToday={() => setMonday(startOfWeek(hoy))}
        onAdd={() => onEdit(nuevaTarea(esEsta ? hoy : monday))} />
      <div className="week-grid">
        {weekDays(monday).map((dia, i) => (
          <div key={dia} className={`week-col ${dia === hoy ? 'is-today' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={onDrop(dia)}>
            <div className="week-col-head">
              <span className="dow">{DIAS_CORTOS[i]}</span>
              <span className="dnum">{dayOfMonth(dia)}</span>
              <button className="icon-btn subtle add-day" aria-label={`Añadir tarea el ${shortDate(dia)}`} onClick={() => onEdit(nuevaTarea(dia))}><Icon name="plus" size={15} /></button>
            </div>
            {tareasDelDia(data.tareas, dia).map((t) => (
              <div key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/tarea', t.id)}>
                <TareaCard t={t} onEdit={onEdit} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function VistaMes({ mes, setMes, hoy, onEdit }: { mes: string; setMes: (s: string) => void; hoy: string; onEdit: (d: TareaDraft) => void }) {
  const { data, run } = useStore();
  const mk = monthKey(mes);

  const onDrop = (fecha: string) => (e: DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/tarea');
    if (id) run((d) => uc.editarTarea(d, id, { fecha }));
  };

  return (
    <>
      <NavFlechas label={monthName(mes)} onPrev={() => setMes(addMonths(mes, -1))} onNext={() => setMes(addMonths(mes, 1))}
        onToday={() => setMes(startOfMonth(hoy))} onAdd={() => onEdit(nuevaTarea(monthKey(hoy) === mk ? hoy : mes))} />
      <Leyenda />
      <div className="month-scroll">
        <div className="month-grid">
          {DIAS_CORTOS.map((d) => <span key={d} className="month-dow">{d}</span>)}
          {monthGrid(mes).map((dia) => (
            <div key={dia} className={`month-cell ${monthKey(dia) !== mk ? 'is-other' : ''} ${dia === hoy ? 'is-today' : ''}`}
              onDragOver={(e) => e.preventDefault()} onDrop={onDrop(dia)}
              onDoubleClick={() => onEdit(nuevaTarea(dia))}>
              <button className="month-num" aria-label={`Añadir tarea el ${shortDate(dia)}`} onClick={() => onEdit(nuevaTarea(dia))}>{dayOfMonth(dia)}</button>
              {tareasDelDia(data.tareas, dia).map((t) => (
                <button key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/tarea', t.id)}
                  className={`month-chip tipo-soft-${t.tipo} ${t.hecha ? 'is-done' : ''} ${!t.hecha && t.fecha < hoy ? 'is-late' : ''}`}
                  onClick={() => onEdit(t)}>{t.titulo}</button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Leyenda() {
  return (
    <div className="legend cal-legend">
      <span><i className="dot tipo-bg-tema" />Temas</span>
      <span><i className="dot tipo-bg-caso" />Casos</span>
      <span><i className="dot tipo-bg-programacion" />Programación</span>
      <span><i className="dot tipo-bg-importante" />Importante</span>
      <span><i className="dot tipo-bg-otro" />Otros</span>
    </div>
  );
}

function VistaJunio({ hoy, onEdit }: { hoy: string; onEdit: (d: TareaDraft) => void }) {
  const { data, run } = useStore();
  const r = ritmoEstudio(data, hoy);
  const semanas = weeksBetween(hoy, data.ajustes.fechaExamen);
  const porMes = new Map<string, string[]>();
  for (const w of semanas) {
    const k = monthKey(addDays(w, 3)); // la semana pertenece al mes de su jueves
    porMes.set(k, [...(porMes.get(k) ?? []), w]);
  }
  const conTarea = new Set(data.tareas.filter((t) => t.fichaId).map((t) => t.fichaId));
  const sinSemana = fichasDe(data, 'tema').filter((t) => t.estado !== 'terminado' && !conTarea.has(t.id));
  const examenSemana = startOfWeek(data.ajustes.fechaExamen);

  const onDrop = (monday: string) => (e: DragEvent) => {
    e.preventDefault();
    const tareaId = e.dataTransfer.getData('text/tarea');
    const fichaId = e.dataTransfer.getData('text/ficha');
    if (tareaId) {
      run((d) => {
        const t = d.tareas.find((x) => x.id === tareaId);
        if (!t) return d;
        const offset = (parseISODate(t.fecha).getDay() + 6) % 7;
        return uc.editarTarea(d, tareaId, { fecha: addDays(monday, offset) });
      });
    } else if (fichaId) {
      run((d) => {
        const f = d.fichas.find((x) => x.id === fichaId);
        if (!f) return d;
        return uc.crearTarea(d, { titulo: nombreFicha(f), tipo: 'tema', fecha: monday, hecha: false, fichaId });
      });
    }
  };

  const ritmo = r.porSemana === 0 ? '0' : r.porSemana <= 1 ? '1' : `${Math.floor(r.porSemana)}–${Math.ceil(r.porSemana)}`;

  return (
    <>
      <div className="stats">
        <div className="stat"><span>Semanas de estudio</span><b>{r.semanasEstudio}</b><small>hasta el {shortDate(data.ajustes.finEstudio)}</small></div>
        <div className="stat"><span>Temas por terminar</span><b className="c-tema">{r.temasPendientes}</b><small>de {r.temasTotales}</small></div>
        <div className="stat stat-accent"><span>Ritmo necesario</span><b>{ritmo} temas</b><small>por semana ({r.porSemana.toFixed(1).replace('.', ',')})</small></div>
        <div className="stat"><span>Sin semana asignada</span><b>{r.temasSinSemana} temas</b><small>arrástralos a una semana</small></div>
      </div>

      {sinSemana.length > 0 && (
        <div className="unassigned">
          <span className="small muted">Temas sin semana:</span>
          {sinSemana.map((f) => (
            <span key={f.id} className="mini-chip tipo-soft-tema draggable" draggable title={f.titulo || undefined}
              onDragStart={(e) => e.dataTransfer.setData('text/ficha', f.id)}>T{f.numero}</span>
          ))}
        </div>
      )}

      <div className="months-board">
        {[...porMes.entries()].map(([k, weeks]) => (
          <div key={k} className="month-col">
            <span className="month-col-title">{monthLabel(`${k}-01`)}</span>
            {weeks.map((w) => {
              const tareas = tareasDeSemana(data.tareas, w);
              const repaso = w > data.ajustes.finEstudio;
              const esExamen = w === examenSemana;
              return (
                <div key={w} className={`week-box ${w === startOfWeek(hoy) ? 'is-now' : ''} ${esExamen ? 'is-exam' : ''}`}
                  onDragOver={(e) => e.preventDefault()} onDrop={onDrop(w)}>
                  <span className="week-box-label">
                    {shortDate(w)}{w === startOfWeek(hoy) ? ' · esta semana' : ''}
                    <button className="icon-btn subtle tiny" aria-label={`Añadir tarea en la semana del ${shortDate(w)}`} onClick={() => onEdit(nuevaTarea(w))}><Icon name="plus" size={13} /></button>
                  </span>
                  <span className="chips">
                    {tareas.map((t) => (
                      <button key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/tarea', t.id)}
                        className={`mini-chip tipo-soft-${t.tipo} ${t.hecha ? 'is-done' : ''}`} title={t.titulo} onClick={() => onEdit(t)}>
                        {abreviar(t, data.fichas)}
                      </button>
                    ))}
                    {esExamen && <span className="mini-chip exam-chip">Examen</span>}
                    {!esExamen && repaso && tareas.length === 0 && <span className="mini-chip repaso-chip">Repaso</span>}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

function abreviar(t: Tarea, fichas: { id: string; kind: string; numero: number }[]): string {
  const f = fichas.find((x) => x.id === t.fichaId);
  if (!f) return t.titulo.length > 14 ? `${t.titulo.slice(0, 13)}…` : t.titulo;
  return { tema: 'T', caso: 'C', unidad: 'U', apartado: 'A' }[f.kind as 'tema'] + f.numero;
}
