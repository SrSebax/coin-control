import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Edit,
  ChevronDown,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { itemsRoutes } from "../routes/itemsRoutes";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "../hooks/useTheme";
import logoIconDark from "../assets/favicon-dark.svg";
import logoIconLight from "../assets/favicon-light.svg";
import logoFull from "../assets/coin-control-dark.svg";

const EXPANDABLE = {
  "/categories": { key: "categories", editPath: "/select-category", editLabel: "Editar categoría", matchEdit: "/edit-category/" },
  "/new-entry": { key: "entries", editPath: "/select-entry", editLabel: "Editar movimiento", matchEdit: "/edit-entry/" },
};

function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map((w) => w.charAt(0)).join("").toUpperCase().substring(0, 2);
}

export default function Sidebar({ collapsed }) {
  const { pathname } = useLocation();
  const { user, displayName } = useCurrentUser();
  const { isDark } = useTheme();
  const [expandedItems, setExpandedItems] = useState({
    categories: pathname.includes("/categories") || pathname.includes("/select-category") || pathname.includes("/edit-category"),
    entries: pathname.includes("/new-entry") || pathname.includes("/select-entry") || pathname.includes("/edit-entry"),
  });

  const toggleExpanded = (item) => {
    if (collapsed) return;
    setExpandedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const widthClass = collapsed ? "w-16" : "w-64";

  const activeClasses = "bg-gradient-to-r from-emerald-600/50 to-emerald-600/10 text-white";
  const inactiveClasses = "text-white/65 hover:bg-white/5 hover:text-white";

  return (
    <aside
      className={`hidden md:flex bg-gradient-to-b from-[#0b1a15] to-[#081310] border-r border-white/5 transition-all duration-300 ease-in-out h-screen flex-col shadow-lg ${widthClass}`}
    >
      {/* Cabecera */}
      <div className="flex items-center px-4 py-4 shrink-0">
        <Link to="/home" className="flex items-center gap-2.5 min-w-0" aria-label="Inicio">
          {collapsed ? (
            <img
              src={isDark ? logoIconDark : logoIconLight}
              alt="CoinControl"
              className="w-11 h-11 rounded-full shrink-0"
            />
          ) : (
            <img src={logoFull} alt="CoinControl" className="h-11 w-auto" />
          )}
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1 px-2 flex-1 overflow-y-auto">
        {itemsRoutes.map(({ path, label, icon }) => {
          const expandable = EXPANDABLE[path];

          if (expandable) {
            const isExpanded = expandedItems[expandable.key];
            const isEditActive =
              pathname === expandable.editPath || pathname.startsWith(expandable.matchEdit);

            return (
              <div key={path} className="flex flex-col">
                <div
                  className={`flex items-center rounded-lg transition-all duration-200 ${
                    pathname === path ? activeClasses : inactiveClasses
                  }`}
                >
                  <Link
                    to={path}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium flex-grow"
                  >
                    {icon}
                    {!collapsed && <span>{label}</span>}
                  </Link>
                  {!collapsed && (
                    <button
                      onClick={() => toggleExpanded(expandable.key)}
                      className="pr-3 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                      aria-label={isExpanded ? `Contraer ${label}` : `Expandir ${label}`}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  )}
                </div>
                {!collapsed && isExpanded && (
                  <Link
                    to={expandable.editPath}
                    className={`flex items-center gap-3 px-3 py-2 ml-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isEditActive ? activeClasses : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Edit size={16} />
                    <span>{expandable.editLabel}</span>
                  </Link>
                )}
              </div>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === path ? activeClasses : inactiveClasses
              }`}
            >
              {icon}
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + créditos */}
      <div className="shrink-0 border-t border-white/5 px-2 py-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition"
        >
          <span className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {getInitials(displayName)}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-white truncate">
                  {displayName || "Usuario"}
                </span>
                <span className="block text-xs text-white/40 truncate">{user?.email || ""}</span>
              </span>
              <ChevronsRight size={14} className="text-white/30 shrink-0" />
            </>
          )}
        </Link>
        {!collapsed && (
          <p className="text-[10px] text-white/25 text-center pt-2">Hecho por Nørdware</p>
        )}
      </div>
    </aside>
  );
}
