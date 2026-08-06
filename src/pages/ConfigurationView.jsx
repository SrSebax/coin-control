import { useState } from "react";
import Layout from "../components/Layout";
import PageHeading from "../components/PageHeading";
import SelectInput from "../components/inputs/SelectInput";
import { Moon, Sun, Globe, User, Bell, Shield } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function ConfigurationView() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("es");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const themeOptions = [
    { id: "light", name: "Tema Claro", icon: "Sun" },
    { id: "dark", name: "Tema Oscuro", icon: "Moon" },
    { id: "system", name: "Usar configuración del sistema", icon: "Laptop" }
  ];

  const languageOptions = [
    { id: "es", name: "Español", icon: "Globe" },
    { id: "en", name: "English", icon: "Globe" }
  ];

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    // Aquí se implementaría la lógica para cambiar el idioma
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // Aquí se implementaría la lógica para activar/desactivar notificaciones
  };

  return (
    <Layout>
      <div className="bg-surface/90 backdrop-blur-sm rounded-2xl shadow-lg border border-divider p-6 space-y-8 transition-all duration-300 hover:shadow-xl">
        <div className="text-center sm:text-left">
          <PageHeading title="Configuración" />
        </div>

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
                <User size={20} />
              </div>
              <h3 className="text-lg font-bold text-text">Perfil de Usuario</h3>
            </div>
            
            <div className="p-4 bg-surface-alt rounded-xl border border-divider">
              <p className="text-sm text-text-secondary">
                Para actualizar tu información de perfil, por favor visita la configuración de tu cuenta.
              </p>
              <button className="mt-3 px-4 py-2 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors">
                Gestionar perfil
              </button>
            </div>
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

          {/* Sección de Privacidad */}
          <div className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-lg text-red-600 dark:text-red-300">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-text">Privacidad y Seguridad</h3>
            </div>
            
            <div className="p-4 bg-surface-alt rounded-xl border border-divider">
              <p className="text-sm text-text-secondary">
                CoinControl respeta tu privacidad y protege tus datos. Tus transacciones y datos financieros están seguros y encriptados.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-hover text-text-secondary rounded-lg text-sm font-medium hover:bg-active transition-colors">
                  Política de privacidad
                </button>
                <button className="px-4 py-2 bg-hover text-text-secondary rounded-lg text-sm font-medium hover:bg-active transition-colors">
                  Términos de servicio
                </button>
                <button className="px-4 py-2 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors">
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="cursor-pointer px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm">
            Guardar cambios
          </button>
        </div>
      </div>
    </Layout>
  );
}
