import logoLight from "../assets/coin-control-light.svg";
import logoDark from "../assets/coin-control-dark.svg";
import { useTheme } from "../hooks/useTheme";

export default function SplashView() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-primary-soft)] via-[var(--color-background)] to-[var(--color-background)] dark:bg-none dark:bg-background">
      {/* Círculos decorativos animados */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-teal-300 dark:bg-teal-500/30 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-14 left-14 w-32 h-32 bg-emerald-300 dark:bg-emerald-500/20 rounded-full blur-2xl opacity-20 animate-ping" />
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-surface rounded-full blur-[100px] opacity-10" />

      {/* Logo central */}
      <img
        src={isDark ? logoDark : logoLight}
        alt="CoinControl"
        className="p-3 h-28 w-auto animate-soft-bounce drop-shadow-xl relative z-10"
      />

      {/* Texto descriptivo */}
      <p className="mt-6 text-lg text-emerald-700 dark:text-emerald-300 font-semibold tracking-wide animate-fade-in z-10">
        Cargando tu espacio financiero...
      </p>

      {/* Barra de carga animada con efecto de brillo */}
      <div className="mt-8 w-56 h-2 bg-surface-alt rounded-full overflow-hidden shadow-inner relative z-10">
        <div className="loading-bar-glow absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full" />
      </div>
    </div>
  );
}
