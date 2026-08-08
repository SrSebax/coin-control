import { parseLocalDate } from "./date";

const UNIT_LABELS = {
  daily: ["día", "días"],
  weekly: ["semana", "semanas"],
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
