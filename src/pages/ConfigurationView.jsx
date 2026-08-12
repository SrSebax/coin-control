import { useRef, useState } from "react";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import ToastMessage from "../components/ToastMessage";
import {
  Moon,
  Sun,
  Laptop,
  Globe,
  Bell,
  LogOut,
  Download,
  Upload,
  Instagram,
  Linkedin,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  Share,
  Repeat,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogoutController } from "../controller/LogoutController";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import { useBudget } from "../hooks/useBudget";
import { usePwaInstall } from "../hooks/usePwaInstall";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/sebax_lond/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sebastian-londo%C3%B1o-mesa/", icon: Linkedin },
  { label: "Sitio web", href: "https://desarrollador-frontend-sebaslondev.vercel.app/", icon: Globe },
];

export default function ConfigurationView() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, displayName } = useCurrentUser();
  const { logout } = useLogoutController();
  const { transactions, importTransactions } = useTransactions();
  const { categories, importCategories } = useCategories();
  const {
    amount: budgetAmount,
    period: budgetPeriod,
    biweeklyAnchorDay,
    biweeklyAmounts,
    updateBudget,
  } = useBudget();
  const { isInstalled, isInstallable, isIOS, promptInstall } = usePwaInstall();

  const [language] = useState("es");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const handleToggleNotifications = () => setNotificationsEnabled((v) => !v);

  const initial = (displayName || user?.email || "U")[0].toUpperCase();

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      budget: { amount: budgetAmount, period: budgetPeriod, biweeklyAnchorDay, biweeklyAmounts },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coincontrol-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleRestartTutorial = () => navigate("/home", { state: { startTutorial: true } });

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed.transactions) || typeof parsed.categories !== "object") {
          throw new Error("Formato inválido");
        }
        setPendingImport(parsed);
      } catch {
        setToast({ message: "El archivo no es un backup válido de CoinControl.", type: "error" });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!pendingImport || isImporting) return;
    setIsImporting(true);
    try {
      await importTransactions(pendingImport.transactions);
      await importCategories(pendingImport.categories);
      if (pendingImport.budget) {
        updateBudget({
          amount: pendingImport.budget.amount,
          period: pendingImport.budget.period || "monthly",
          biweeklyAnchorDay: pendingImport.budget.biweeklyAnchorDay || 15,
          biweeklyAmounts: pendingImport.budget.biweeklyAmounts || { first: null, second: null },
        });
      }
      setToast({ message: "Respaldo restaurado correctamente.", type: "success" });
    } catch {
      setToast({ message: "No se pudo restaurar el respaldo. Intenta de nuevo.", type: "error" });
    } finally {
      setIsImporting(false);
      setPendingImport(null);
    }
  };

  return (
    <Layout title="Configuración" subtitle="General y Cuenta" showTitleOnMobile hideHeaderActions>
      <ToastMessage
        open={!!toast}
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Mobile: pantalla dedicada con el mismo lenguaje visual que Inicio/Categorías */}
      <div className="md:hidden space-y-5">
        <div className="flex items-center gap-3 px-1">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="shrink-0 w-11 h-11 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <span className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-base font-bold text-text truncate">{displayName || "Usuario"}</p>
            <p className="text-sm text-text-tertiary truncate">{user?.email || ""}</p>
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-surface rounded-2xl border border-divider p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sun size={16} className="text-text-tertiary" />
            <p className="text-sm font-semibold text-text">Tema</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "light", label: "Claro", icon: Sun },
              { id: "dark", label: "Oscuro", icon: Moon },
              { id: "system", label: "Sistema", icon: Laptop },
            ].map((opt) => {
              const ThemeIcon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`cursor-pointer flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors ${
                    isSelected ? "bg-emerald-500 text-white" : "bg-surface-alt text-text-secondary"
                  }`}
                >
                  <ThemeIcon size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Idioma */}
        <div className="bg-surface rounded-2xl border border-divider p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-text-tertiary" />
            <p className="text-sm font-semibold text-text">Idioma</p>
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-text-tertiary bg-surface-alt px-2 py-0.5 rounded-full">
              Próximamente
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "es", label: "Español" },
              { id: "en", label: "English" },
            ].map(({ id, label }) => {
              const isSelected = language === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled
                  className={`cursor-not-allowed opacity-50 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isSelected ? "bg-emerald-500 text-white" : "bg-surface-alt text-text-secondary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-surface rounded-2xl border border-divider p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className="text-text-tertiary shrink-0" />
            <p className="text-sm font-medium text-text">Notificaciones</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            onClick={handleToggleNotifications}
            className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationsEnabled ? "bg-emerald-500" : "bg-hover"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Datos */}
        <div className="bg-surface rounded-2xl border border-divider divide-y divide-divider overflow-hidden">
          <button
            type="button"
            onClick={() => navigate("/recurring-movements")}
            className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-hover transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Repeat size={16} className="text-text-tertiary shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-text">Movimientos recurrentes</p>
                <p className="text-xs text-text-tertiary">Revisa y edita tus programaciones automáticas</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-muted shrink-0" />
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-hover transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Download size={16} className="text-text-tertiary shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-text">Exportar datos</p>
                <p className="text-xs text-text-tertiary">Descarga un respaldo de tus movimientos y categorías</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-muted shrink-0" />
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-hover transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Upload size={16} className="text-text-tertiary shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-text">Importar datos</p>
                <p className="text-xs text-text-tertiary">Restaura un respaldo previamente exportado</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-text-muted shrink-0" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>

        {/* App */}
        <div className="bg-surface rounded-2xl border border-divider overflow-hidden">
          {isInstalled ? (
            <div className="w-full flex items-center gap-2.5 p-4">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-text">App Instalada</p>
                <p className="text-xs text-text-tertiary">¡Gracias por descargar la App!</p>

              </div>
            </div>
          ) : isInstallable ? (
            <button
              type="button"
              onClick={promptInstall}
              className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-hover transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone size={16} className="text-text-tertiary shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-text">Descargar app</p>
                  <p className="text-xs text-text-tertiary">Instalala en la pantalla de inicio de tu celular</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-text-muted shrink-0" />
            </button>
          ) : isIOS ? (
            <div className="w-full flex items-center gap-2.5 p-4">
              <Share size={16} className="text-text-tertiary shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-text">Descargar app</p>
                <p className="text-xs text-text-tertiary">
                  Tocá Compartir y elegí "Agregar a inicio" para instalarla
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center gap-2.5 p-4">
              <Smartphone size={16} className="text-text-tertiary shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-text">Descargar app</p>
                <p className="text-xs text-text-tertiary">
                  Abrí este link desde Chrome en tu celular para instalarla
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ayuda */}
        <button
          type="button"
          onClick={handleRestartTutorial}
          className="cursor-pointer w-full flex items-center justify-between p-4 bg-surface rounded-2xl border border-divider hover:bg-hover transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle size={16} className="text-text-tertiary shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-text">Ver tutorial de nuevo</p>
              <p className="text-xs text-text-tertiary">Repite el recorrido guiado de Inicio</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-muted shrink-0" />
        </button>

        {/* Cuenta */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-text-tertiary mb-3">Desarrollado por Sebastian Londoño</p>
          <p className="text-xs text-text-tertiary mb-3">Un agradecimiento especial a Ana Naranjo</p>
          <p className="text-xs text-text-tertiary mb-3">Versión {import.meta.env.VITE_APP_VERSION}</p>
          <div className="flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map((social) => {
              const SocialIcon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2.5 rounded-full text-text-tertiary hover:text-text hover:bg-hover transition-colors"
                >
                  <SocialIcon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Escritorio: paridad con mobile */}
      <div className="hidden md:block space-y-6">
        {/* Perfil */}
        <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="shrink-0 w-14 h-14 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <span className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {initial}
              </span>
            )}
            <div>
              <p className="text-lg font-bold text-text">{displayName || "Usuario"}</p>
              <p className="text-sm text-text-tertiary">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Apariencia */}
            <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sun size={18} className="text-text-tertiary" />
                <h3 className="font-semibold text-text">Apariencia</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "light", label: "Claro", icon: Sun },
                  { id: "dark", label: "Oscuro", icon: Moon },
                  { id: "system", label: "Sistema", icon: Laptop },
                ].map((opt) => {
                  const ThemeIcon = opt.icon;
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={`cursor-pointer flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-colors ${
                        isSelected ? "bg-emerald-500 text-white" : "bg-surface-alt text-text-secondary hover:bg-hover"
                      }`}
                    >
                      <ThemeIcon size={16} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Idioma */}
            <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={18} className="text-text-tertiary" />
                <h3 className="font-semibold text-text">Idioma</h3>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-text-tertiary bg-surface-alt px-2 py-0.5 rounded-full">
                  Próximamente
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "es", label: "Español" },
                  { id: "en", label: "English" },
                ].map(({ id, label }) => {
                  const isSelected = language === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled
                      className={`cursor-not-allowed opacity-50 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isSelected ? "bg-emerald-500 text-white" : "bg-surface-alt text-text-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell size={18} className="text-text-tertiary shrink-0" />
                <p className="text-sm font-medium text-text">Notificaciones</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                onClick={handleToggleNotifications}
                className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? "bg-emerald-500" : "bg-hover"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            {/* Datos */}
            <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider divide-y divide-divider overflow-hidden">
              <button
                type="button"
                onClick={() => navigate("/recurring-movements")}
                className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-hover transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Repeat size={16} className="text-text-tertiary shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">Movimientos recurrentes</p>
                    <p className="text-xs text-text-tertiary">Revisa y edita tus programaciones automáticas</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-hover transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Download size={16} className="text-text-tertiary shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">Exportar datos</p>
                    <p className="text-xs text-text-tertiary">Descarga un respaldo de tus movimientos y categorías</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleImportClick}
                className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-hover transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Upload size={16} className="text-text-tertiary shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">Importar datos</p>
                    <p className="text-xs text-text-tertiary">Restaura un respaldo previamente exportado</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-text-muted shrink-0" />
              </button>
            </div>

            {/* App */}
            <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-md border border-divider overflow-hidden">
              {isInstalled ? (
                <div className="w-full flex items-center gap-2.5 p-4">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">App instalada</p>
                    <p className="text-xs text-text-tertiary">¡Gracias por instalar CoinControl!</p>
                  </div>
                </div>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={promptInstall}
                  className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone size={16} className="text-text-tertiary shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-text">Instalar app</p>
                      <p className="text-xs text-text-tertiary">Instalala en tu computador para acceso rápido</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted shrink-0" />
                </button>
              ) : isIOS ? (
                <div className="w-full flex items-center gap-2.5 p-4">
                  <Share size={16} className="text-text-tertiary shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">Descargar app</p>
                    <p className="text-xs text-text-tertiary">
                      Tocá Compartir y elegí "Agregar a inicio" para instalarla
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center gap-2.5 p-4">
                  <Smartphone size={16} className="text-text-tertiary shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">Instalar app</p>
                    <p className="text-xs text-text-tertiary">
                      Abrí este link desde Chrome para instalarla en tu computador
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-text-tertiary mb-1">Desarrollado por Sebastian Londoño</p>
          <p className="text-xs text-text-tertiary mb-1">Un agradecimiento especial a Ana Naranjo</p>
          <p className="text-xs text-text-tertiary mb-3">Versión {import.meta.env.VITE_APP_VERSION}</p>
          <div className="flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map((social) => {
              const SocialIcon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2.5 rounded-full text-text-tertiary hover:text-text hover:bg-hover transition-colors"
                >
                  <SocialIcon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="¿Cerrar sesión?"
        message="¿Estás seguro que deseas cerrar tu sesión?"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
      />

      <ConfirmModal
        open={!!pendingImport}
        title="¿Restaurar respaldo?"
        message="Esto reemplazará todos tus movimientos y categorías actuales por los del archivo. Esta acción no se puede deshacer."
        onCancel={() => setPendingImport(null)}
        onConfirm={handleConfirmImport}
      />
    </Layout>
  );
}
