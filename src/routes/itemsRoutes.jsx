import {
  Home,
  PieChart,
  Settings,
  FolderKanban,
  PlusCircle,
  Edit,
  PiggyBank,
  Wallet,
} from "lucide-react";

export const itemsRoutes = [
  { path: "/home", label: "Inicio", icon: <Home size={20} /> },
  {
    path: "/new-entry",
    label: "Movimientos",
    icon: <PlusCircle size={20} />,
  },
  {
    path: "/categories",
    label: "Categorías",
    icon: <FolderKanban size={20} />,
  },
  {
    path: "/pockets",
    label: "Bolsillos",
    icon: <Wallet size={20} />,
  },
  {
    path: "/budget",
    label: "Presupuesto",
    icon: <PiggyBank size={20} />,
  },
  { path: "/settings", label: "Configuración", icon: <Settings size={20} /> },
];
