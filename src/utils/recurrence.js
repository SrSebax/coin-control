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

    // Si el día objetivo de este mismo mes todavía no ha pasado respecto a
    // `d`, la siguiente ocurrencia es ese día — no hay que saltar un mes
    // entero (p. ej. día 18, `d` es el 12: la próxima es el 18 de este mes,
    // no el del mes siguiente).
    if (interval === 1) {
      const sameMonthDay = Math.min(targetDay, lastDayOfMonth(d.getFullYear(), d.getMonth()));
      const sameMonthCandidate = new Date(d.getFullYear(), d.getMonth(), sameMonthDay);
      if (sameMonthCandidate > d) return sameMonthCandidate;
    }

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
// generada y hoy, respetando fecha de fin si existe. La plantilla en sí
// (`recurring: true`) no es un movimiento — solo la programación — así que
// su propia fecha de inicio cuenta como la primera ocurrencia si ya llegó.
export function generateDueOccurrences(template, today = new Date()) {
  const { recurrence } = template;
  if (!recurrence) return { occurrences: [], lastDate: null };

  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endDate = recurrence.endDate ? parseLocalDate(recurrence.endDate) : null;

  const occurrences = [];
  let cursor;

  if (recurrence.lastGeneratedDate) {
    cursor = parseLocalDate(recurrence.lastGeneratedDate);
  } else {
    const originalDate = parseLocalDate(template.date);
    if (originalDate <= todayMid && (!endDate || originalDate <= endDate)) {
      occurrences.push(toISODateString(originalDate));
    }
    cursor = originalDate;
  }

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

// Cantidad de ocurrencias de una plantilla que caen dentro de [rangeStart,
// rangeEnd] (ambos inclusive). Mismo algoritmo que generateDueOccurrences,
// pero acotado por una fecha de fin de rango en vez de "hoy" — sirve para
// estimar cuántas veces se generará dentro de un mes futuro o el actual.
export function countOccurrencesInRange(template, rangeStart, rangeEnd) {
  const { recurrence } = template;
  if (!recurrence) return 0;

  const endDate = recurrence.endDate ? parseLocalDate(recurrence.endDate) : null;
  let cursor;
  let count = 0;

  if (recurrence.lastGeneratedDate) {
    cursor = parseLocalDate(recurrence.lastGeneratedDate);
  } else {
    cursor = parseLocalDate(template.date);
    if (cursor >= rangeStart && cursor <= rangeEnd && (!endDate || cursor <= endDate)) count++;
  }

  let safety = 0;
  while (safety < MAX_OCCURRENCES) {
    safety++;
    const next = addInterval(cursor, recurrence.frequency, recurrence.interval, recurrence.dayOfMonth);
    if (endDate && next > endDate) break;
    if (next > rangeEnd) break;
    if (next >= rangeStart) count++;
    cursor = next;
  }

  return count;
}

// Rango [inicio, fin] del período de presupuesto que contiene `referenceDate`.
// "biweekly" divide el mes en dos mitades según `anchorDay` (día de corte,
// por defecto 15): 1-anchorDay y (anchorDay+1)-fin de mes. `half` indica cuál
// de las dos mitades es — sirve para saber a cuál de los dos montos
// (`biweeklyAmounts.first` / `.second`) aplica.
export function budgetPeriodRange(period, referenceDate = new Date(), anchorDay = 15) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  if (period === "biweekly") {
    const cutoff = Math.min(Math.max(anchorDay || 15, 1), 27);
    const day = referenceDate.getDate();
    if (day <= cutoff) {
      return { start: new Date(year, month, 1), end: new Date(year, month, cutoff), half: "first" };
    }
    return { start: new Date(year, month, cutoff + 1), end: new Date(year, month + 1, 0), half: "second" };
  }

  return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0), half: null };
}

// Las dos mitades del mes de `referenceDate` según `anchorDay`, sin importar
// cuál esté "en curso" — sirve para comparar ambas quincenas lado a lado.
export function budgetPeriodHalves(referenceDate = new Date(), anchorDay = 15) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const cutoff = Math.min(Math.max(anchorDay || 15, 1), 27);

  return {
    first: { start: new Date(year, month, 1), end: new Date(year, month, cutoff), half: "first" },
    second: { start: new Date(year, month, cutoff + 1), end: new Date(year, month + 1, 0), half: "second" },
  };
}

// Etiqueta legible del rango de un período de presupuesto, p. ej.
// "1 - 15 de agosto" (biweekly) o "agosto de 2026" (monthly).
export function formatBudgetRangeLabel(period, range) {
  if (period === "biweekly") {
    const fmt = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
    return `${fmt(range.start)} - ${fmt(range.end)}`;
  }
  return range.start.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

function filterRecurringExpenseTemplates(templates) {
  return templates.filter((t) => t.recurring && t.recurrence && t.type === "expense");
}

// Total esperado de gastos recurrentes dentro de un rango [start, end] explícito.
export function sumRecurringExpenseInRange(templates, start, end) {
  return filterRecurringExpenseTemplates(templates).reduce(
    (sum, t) => sum + t.amount * countOccurrencesInRange(t, start, end),
    0
  );
}

// Detalle por plantilla del total esperado dentro de un rango [start, end] explícito.
export function breakdownRecurringExpenseInRange(templates, start, end) {
  return filterRecurringExpenseTemplates(templates)
    .map((t) => {
      const occurrences = countOccurrencesInRange(t, start, end);
      return { template: t, occurrences, subtotal: t.amount * occurrences };
    })
    .filter((entry) => entry.occurrences > 0)
    .sort((a, b) => b.subtotal - a.subtotal);
}

// Total esperado de gastos recurrentes para el período de presupuesto
// ("monthly" o "biweekly") que contiene `referenceDate`.
export function estimateRecurringExpenseForPeriod(templates, period = "monthly", referenceDate = new Date(), anchorDay = 15) {
  const { start, end } = budgetPeriodRange(period, referenceDate, anchorDay);
  return sumRecurringExpenseInRange(templates, start, end);
}

// Detalle por plantilla del total esperado en ese período (para la vista detallada).
export function breakdownRecurringExpenseForPeriod(templates, period = "monthly", referenceDate = new Date(), anchorDay = 15) {
  const { start, end } = budgetPeriodRange(period, referenceDate, anchorDay);
  return breakdownRecurringExpenseInRange(templates, start, end);
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
