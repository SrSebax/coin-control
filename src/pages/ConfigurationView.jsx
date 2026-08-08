import { useRef, useState } from "react";
import Layout from "../components/Layout";
import SelectInput from "../components/inputs/SelectInput";
import ConfirmModal from "../components/ConfirmModal";
import ToastMessage from "../components/ToastMessage";
import {
  Moon,
  Sun,
  Laptop,
  Globe,
  Bell,
  Shield,
  LogOut,
  Download,
  Upload,
  Instagram,
  Linkedin,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogoutController } from "../controller/LogoutController";
import { useTransactions } from "../hooks/useLocalStorage";
import { useCategories } from "../hooks/useCategories";
import { useBudget } from "../hooks/useBudget";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/sebax_lond/", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sebastian-londo%C3%B1o-mesa/", icon: Linkedin },
  { label: "Sitio web", href: "https://desarrollador-frontend-sebaslondev.vercel.app/", icon: Globe },
];

export default function ConfigurationView() {
  const { theme, setTheme } = useTheme();
  const { user, displayName } = useCurrentUser();
  const { logout } = useLogoutController();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { amount: budgetAmount } = useBudget();

  const [language, setLanguage] = useState("es");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const themeOptions = [
    { id: "light", name: "Tema Claro", icon: "Sun" },
    { id: "dark", name: "Tema Oscuro", icon: "Moon" },
    { id: "system", name: "Usar configuración del sistema", icon: "Laptop" },
  ];

  const languageOptions = [
    { id: "es", name: "Español", icon: "Globe" },
    { id: "en", name: "English", icon: "Globe" },
  ];

  const handleThemeChange = (e) => setTheme(e.target.value);
  const handleLanguageChange = (e) => setLanguage(e.target.value);
  const handleToggleNotifications = () => setNotificationsEnabled((v) => !v);

  const initial = (displayName || user?.email || "U")[0].toUpperCase();

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      categories,
      budget: { amount: budgetAmount },
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

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    localStorage.setItem("coinControl_transactions", JSON.stringify(pendingImport.transactions));
    localStorage.setItem("coinControl_categories", JSON.stringify(pendingImport.categories));
    if (pendingImport.budget) {
      localStorage.setItem("coinControl_budget", JSON.stringify(pendingImport.budget));
    }
    window.location.reload();
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
          <span className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
            {initial}
          </span>
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
                  onClick={() => setLanguage(id)}
                  className={`cursor-pointer py-2.5 rounded-xl text-sm font-semibold transition-colors ${
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

      {/* Escritorio: sin cambios */}
      <div className="hidden md:block bg-surface/90 backdrop-blur-sm rounded-2xl shadow-lg border border-divider p-6 space-y-8 transition-all duration-300 hover:shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sección de Apariencia */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-300">
                <Sun size={20} />
              </div>
              <h3 className="text-lg font-bold text-text">Apariencia</h3>
            </div>

            <div className="space-y-4">
              <SelectInput
                label="Tema"
                name="theme"
                value={theme}
                onChange={handleThemeChange}
                options={themeOptions}
                isObjectOptions={true}
              />
            </div>
          </div>

          {/* Sección de Idioma */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 dark:bg-green-950/40 rounded-lg text-green-600 dark:text-green-300">
                <Globe size={20} />
              </div>
              <h3 className="text-lg font-bold text-text">Idioma</h3>
            </div>

            <div className="space-y-4">
              <SelectInput
                label="Idioma"
                name="language"
                value={language}
                onChange={handleLanguageChange}
                options={languageOptions}
                isObjectOptions={true}
              />
            </div>
          </div>

          {/* Sección de Perfil */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-lg text-purple-600 dark:text-purple-300">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-text">Perfil de Usuario</h3>
            </div>

            <div className="p-4 bg-surface-alt rounded-xl border border-divider space-y-1">
              <p className="text-sm font-medium text-text">{displayName || "Usuario"}</p>
              <p className="text-sm text-text-secondary">{user?.email || ""}</p>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>

          {/* Sección de Notificaciones */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-600 dark:text-amber-300">
                <Bell size={20} />
              </div>
              <h3 className="text-lg font-bold text-text">Notificaciones</h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-alt rounded-xl border border-divider">
              <span className="text-sm text-text-secondary">Activar notificaciones</span>
              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-active'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
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
