// Money
export const moneyData = {
  ingresos: 1_090_000,
  gastos: 680_000,
};

// Default categories for expenses and incomes (legacy)
export const incomeCategories = ["Trabajo", "Venta", "Regalo"];
export const expenseCategories = ["Comida", "Transporte", "Salud", "Hogar"];

// Default categories with icons and colors
export const defaultCategories = {
  expense: [
    { id: "comida", name: "Comida", color: "#FF6B6B", icon: "Utensils" },
    { id: "transporte", name: "Transporte", color: "#4BC0C0", icon: "Car" },
    { id: "salud", name: "Salud", color: "#FF9E7D", icon: "Heart" },
    { id: "hogar", name: "Hogar", color: "#36A2EB", icon: "Home" }
  ],
  income: [
    { id: "trabajo", name: "Trabajo", color: "#9966FF", icon: "Briefcase" },
    { id: "venta", name: "Venta", color: "#FF6384", icon: "DollarSign" },
    { id: "regalo", name: "Regalo", color: "#FFCE56", icon: "Gift" }
  ]
};