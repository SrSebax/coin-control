import { parseLocalDate } from "./date";

const UNIT_LABELS = {
  daily: ["día", "días"],
  weekly: ["semana", "semanas"],
  biweekly: ["quincena", "quincenas"],
  monthly: ["mes", "meses"],
  yearly: ["año", "años"],
};

export function unitLabel(frequency, count) {
  const [singular, plural] = UNIT_LABELS[frequency] || UNIT_LABELS.monthly;
  return count === 1 ? singular : plural;
}

// Frase corta para mostrar en el chip / banner: "cada mes", "cada 2 semanas"...
export function describeRecurrence(recurrence) {
  if (!recurrence) return "";
  const { frequency, interval } = recurrence;
  if (frequency === "biweekly") {
    const day = recurrence.dayOfMonth || 1;
    return `cada quincena (día ${day} y ${Math.min(day + 15, 31)})`;
  }
  if (interval === 1) {
    return { daily: "cada día", weekly: "cada semana", monthly: "cada mes", yearly: "cada año" }[frequency];
  }
  return `cada ${interval} ${unitLabel(frequency, interval)}`;
}

function toISODateString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function lastDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Para "biweekly": dos anclas por mes, el día elegido por el usuario y ese
// mismo día + 15 (cae al último día del mes si se pasa, p. ej. día 20 -> 31
// en un mes de 31 días).
function biweeklyAnchors(year, month, dayOfMonth) {
  const last = lastDayOfMonth(year, month);
  const first = Math.min(dayOfMonth, last);
  const second = Math.min(dayOfMonth + 15, last);
  return first === second ? [first] : [first, second];
}

function nextBiweeklyDate(date, dayOfMonth) {
  let year = date.getFullYear();
  let month = date.getMonth();

  for (let i = 0; i < 3; i++) {
    for (const day of biweeklyAnchors(year, month, dayOfMonth)) {
      const candidate = new Date(year, month, day);
      if (candidate > date) return candidate;
    }
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return date;
}

// Avanza `date` un intervalo de la frecuencia dada. `dayOfMonth` solo aplica
// a "monthly": si el mes destino tiene menos días, cae al último día del mes.
function addInterval(date, frequency, interval, dayOfMonth) {
  const d = new Date(date);

  if (frequency === "daily") {
    d.setDate(d.getDate() + interval);
    return d;
  }

  if (frequency === "weekly") {
    d.setDate(d.getDate() + interval * 7);
    return d;
  }

  if (frequency === "biweekly") {
    return nextBiweeklyDate(d, dayOfMonth || d.getDate());
  }

  if (frequency === "monthly") {
    const targetDay = dayOfMonth || d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth() + interval;
    year += Math.floor(month / 12);
    month = ((month % 12) + 12) % 12;
    const day = Math.min(targetDay, lastDayOfMonth(year, month));
    return new Date(year, month, day);
  }

  // yearly
  d.setFullYear(d.getFullYear() + interval);
  return d;
}

const MAX_OCCURRENCES = 500; // resguardo ante configuraciones inválidas

// Calcula las fechas (YYYY-MM-DD) que faltan por generar entre la última
// generada (o la fecha original de la plantilla) y hoy, respetando fecha de
// fin si existe. No incluye la fecha original: esa ya es la transacción
// plantilla en sí.
export function generateDueOccurrences(template, today = new Date()) {
  const { recurrence } = template;
  if (!recurrence) return { occurrences: [], lastDate: null };

  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endDate = recurrence.endDate ? parseLocalDate(recurrence.endDate) : null;

  let cursor = recurrence.lastGeneratedDate
    ? parseLocalDate(recurrence.lastGeneratedDate)
    : parseLocalDate(template.date);

  const occurrences = [];
  let safety = 0;

  while (safety < MAX_OCCURRENCES) {
    safety++;
    const next = addInterval(cursor, recurrence.frequency, recurrence.interval, recurrence.dayOfMonth);
    if (next > todayMid) break;
    if (endDate && next > endDate) break;
    occurrences.push(toISODateString(next));
    cursor = next;
  }

  return {
    occurrences,
    lastDate: occurrences.length ? occurrences[occurrences.length - 1] : recurrence.lastGeneratedDate || null,
  };
}

// Fecha (YYYY-MM-DD) de la próxima ocurrencia futura de una plantilla, solo
// para mostrar en la UI. Devuelve null si ya pasó la fecha de fin.
export function previewNextOccurrence(template, today = new Date()) {
  const { recurrence } = template;
  if (!recurrence) return null;

  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endDate = recurrence.endDate ? parseLocalDate(recurrence.endDate) : null;

  let next = recurrence.lastGeneratedDate
    ? parseLocalDate(recurrence.lastGeneratedDate)
    : parseLocalDate(template.date);

  let safety = 0;
  while (next <= todayMid && safety < MAX_OCCURRENCES) {
    next = addInterval(next, recurrence.frequency, recurrence.interval, recurrence.dayOfMonth);
    safety++;
  }

  if (endDate && next > endDate) return null;
  return toISODateString(next);
}
