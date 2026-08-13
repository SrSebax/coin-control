// Cada paso apunta a un `data-tour` en mobile (`id`) y, cuando el layout de
// escritorio usa un componente distinto para lo mismo, a otro en desktop
// (`desktopId`). Si no hay `desktopId`, se usa el mismo `id` en ambos (el
// elemento es compartido, como el filtro de mes o la card de presupuesto).
export const homeTutorialSteps = [
  {
    id: "balance-card",
    desktopId: "balance-card-desktop",
    title: "Tu resumen al toque",
    description: "Acá ves tu saldo disponible y cuánto llevas de ingresos y gastos este mes.",
    radius: 28,
    desktopRadius: 24,
  },
  {
    id: "month-filter",
    title: "Viaja entre meses",
    description: "Toca acá para revisar cualquier mes anterior — todo en la app se actualiza según el mes que elijas.",
    radius: 999,
  },
  {
    id: "fab-add",
    desktopId: "add-desktop",
    title: "Agrega tus movimientos",
    description: "Toca este botón para registrar un gasto o un ingreso rápidamente.",
    radius: 999,
    desktopRadius: 16,
  },
  {
    id: "history-link",
    desktopId: "history-link-desktop",
    title: "Ver todo tu historial",
    description: "Desde acá accedes a todos tus movimientos, con búsqueda y filtros.",
    radius: 14,
  },
  {
    id: "budget-card",
    desktopId: "budget-card-desktop",
    title: "Controla tu presupuesto",
    description: "Define cuánto quieres gastar (mensual o quincenal) y compáralo con lo que ya tienes comprometido en recurrentes.",
    radius: 20,
  },
  {
    id: "tab-bar",
    desktopId: "tab-bar-desktop",
    title: "Explora la app",
    description: "Inicio, Movimientos, Categorías y Configuración, siempre a un toque de distancia.",
    radius: 999,
    desktopRadius: 20,
  },
];
