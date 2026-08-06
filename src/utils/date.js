// Las fechas de transacciones/bolsillos se guardan como "YYYY-MM-DD" (sin hora).
// `new Date("YYYY-MM-DD")` las interpreta como medianoche UTC, así que en
// zonas horarias negativas (ej. Colombia, UTC-5) el día local queda un día
// atrás. Esta función las parsea como fecha local para evitar ese corrimiento.
export function parseLocalDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
}
