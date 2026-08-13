import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Edit,
  ChevronDown,
  ChevronRight,
  ChevronsRight,
  Repeat,
  PiggyBank,
} from "lucide-react";
import { itemsRoutes } from "../routes/itemsRoutes";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "../hooks/useTheme";
import logoIconDark from "../assets/favicon-dark.svg";
import logoIconLight from "../assets/favicon-light.svg";
import logoFullDark from "../assets/coin-control-dark.svg";
import logoFullLight from "../assets/coin-control-light.svg";

const EXPANDABLE = {
  "/categories": { key: "categories", editPath: "/select-category", editLabel: "Editar categoría", matchEdit: "/edit-category/" },
  "/new-entry": {
    key: "entries",
    editPath: "/select-entry",
    editLabel: "Editar movimiento",
    matchEdit: "/edit-entry/",
    extraLinks: [
      {
        path: "/recurring-movements",
        label: "Recurrentes",
        icon: Repeat,
        matchPath: "/new-recurring",
      },
    ],
  },
};

// Ítems que solo viven en el sidebar de escritorio (no van en el tabbar
// mobile, por eso no están en itemsRoutes).
const SIDEBAR_ONLY_ITEMS = [{ path: "/budget", label: "Presupuesto", icon: <PiggyBank size={20} /> }];

const GROUPS = [
  { label: "Principal", paths: ["/home", "/new-entry", "/categories", "/budget"] },
  { label: "Gestión", paths: ["/settings"] },
];

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
    entries:
      pathname.includes("/new-entry") ||
      pathname.includes("/select-entry") ||
      pathname.includes("/edit-entry") ||
      pathname.includes("/recurring-movements") ||
      pathname.includes("/new-recurring"),
  });

  const toggleExpanded = (item) => {
    if (collapsed) return;
    setExpandedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const widthClass = collapsed ? "w-16" : "w-64";

  const activeClasses = "bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 text-[var(--color-primary)]";
  const inactiveClasses = "text-text-secondary hover:bg-hover hover:text-text";

  return (
    <aside
      className={`hidden md:flex bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out h-screen flex-col shadow-lg ${widthClass}`}
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
            <img src={isDark ? logoFullDark : logoFullLight} alt="CoinControl" className="h-11 w-auto" />
          )}
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-4 px-2 flex-1 overflow-y-auto">
        {/* data-tour va en un wrapper propio (no en <nav>, que con flex-1
            se estira a toda la altura disponible y arruina el spotlight
            del tutorial) para que el tour resalte solo los ítems, no el
            espacio vacío debajo. */}
        <div className="flex flex-col gap-4" data-tour="tab-bar-desktop">
        {GROUPS.map((group) => {
          const groupItems = group.paths
            .map((path) => itemsRoutes.find((item) => item.path === path) || SIDEBAR_ONLY_ITEMS.find((item) => item.path === path))
            .filter(Boolean);

          if (groupItems.length === 0) return null;

          return (
            <div key={group.label} className="flex flex-col gap-1">
              {!collapsed && (
                <span className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
                  {group.label}
                </span>
              )}
              {groupItems.map(({ path, label, icon }) => {
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
                            className="pr-3 text-text-tertiary hover:text-text transition-colors cursor-pointer"
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
                            isEditActive ? activeClasses : "text-text-tertiary hover:bg-hover hover:text-text"
                          }`}
                        >
                          <Edit size={16} />
                          <span>{expandable.editLabel}</span>
                        </Link>
                      )}
                      {!collapsed && isExpanded && expandable.extraLinks?.map((extra) => {
                        const ExtraIcon = extra.icon;
                        const isExtraActive =
                          pathname === extra.path || (extra.matchPath && pathname.startsWith(extra.matchPath));
                        return (
                          <Link
                            key={extra.path}
                            to={extra.path}
                            className={`flex items-center gap-3 px-3 py-2 ml-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isExtraActive ? activeClasses : "text-text-tertiary hover:bg-hover hover:text-text"
                            }`}
                          >
                            <ExtraIcon size={16} />
                            <span>{extra.label}</span>
                          </Link>
                        );
                      })}
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
            </div>
          );
        })}
        </div>
      </nav>

      {/* Usuario + créditos */}
      <div className="shrink-0 border-t border-sidebar-border px-2 py-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-hover transition"
        >
          <span className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {getInitials(displayName)}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-text truncate">
                  {displayName || "Usuario"}
                </span>
                <span className="block text-xs text-text-tertiary truncate">{user?.email || ""}</span>
              </span>
              <ChevronsRight size={14} className="text-text-tertiary shrink-0" />
            </>
          )}
        </Link>
        {!collapsed && (
          <p className="text-[10px] text-text-muted text-center pt-2">Hecho por Nørdware</p>
        )}
      </div>
    </aside>
  );
}
