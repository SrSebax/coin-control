import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelectedMonth, recentMonths, MONTH_NAMES } from "../hooks/useSelectedMonth";

function monthLabel(year, month) {
  const name = MONTH_NAMES[month];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

export default function MonthFilter() {
  const { year, month, shortLabel, canGoNext, isCurrentMonth, goToPrevMonth, goToNextMonth, goToMonth, goToCurrentMonth } =
    useSelectedMonth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const months = recentMonths(12);

  const handlePick = (y, m) => {
    goToMonth(y, m);
    setIsOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={containerRef} data-tour="month-filter">
      <div className="flex items-center gap-0.5 rounded-full border border-divider bg-surface-alt/60 pl-0.5 pr-0.5 py-0.5">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Mes anterior"
          className="hidden md:inline-flex cursor-pointer p-1.5 rounded-full text-text-secondary hover:text-text hover:bg-hover transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={`Mes: ${shortLabel}`}
          className={`cursor-pointer inline-flex items-center gap-1 p-2 md:px-1.5 md:py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            isOpen ? "bg-hover text-text" : "text-text hover:bg-hover"
          }`}
        >
          <Calendar size={13} className="text-text-tertiary shrink-0" />
          <span className="hidden md:inline">{shortLabel}</span>
        </button>
        <button
          type="button"
          onClick={goToNextMonth}
          disabled={!canGoNext}
          aria-label="Mes siguiente"
          className="hidden md:inline-flex cursor-pointer p-1.5 rounded-full text-text-secondary hover:text-text hover:bg-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-secondary"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-divider bg-surface shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-divider">
            <p className="text-xs font-semibold text-text-tertiary">Elegir mes</p>
            {!isCurrentMonth && (
              <button
                type="button"
                onClick={() => {
                  goToCurrentMonth();
                  setIsOpen(false);
                }}
                className="cursor-pointer text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Hoy
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {months.map(({ year: y, month: m }) => {
              const isSelected = y === year && m === month;
              return (
                <button
                  key={`${y}-${m}`}
                  type="button"
                  onClick={() => handlePick(y, m)}
                  className={`cursor-pointer w-full text-left px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-text-secondary hover:bg-hover"
                  }`}
                >
                  {monthLabel(y, m)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
