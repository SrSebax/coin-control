import { useState } from "react";
import { useLoginController } from "../controller/LoginController";
import { FcGoogle } from "react-icons/fc";
import nordwareLogo from "../assets/nørdware/nordware-full-white.svg";
import appIcon from "../assets/favicon-light.svg";
import loginIllustration from "../assets/image-login.png";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALERT_STYLES = {
  success: { box: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: CheckCircle2 },
  error: { box: "bg-red-50 border-red-200 text-red-700", icon: AlertCircle },
  info: { box: "bg-blue-50 border-blue-200 text-blue-700", icon: AlertCircle },
};

// Colores fijos siempre (esta pantalla no debe reaccionar al tema claro/oscuro).
function FieldBox(props) {
  const { label, error, trailing, children } = props;
  const FieldIcon = props.icon;
  return (
    <div>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white transition-colors ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        <FieldIcon size={20} className="text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-slate-400">{label}</label>
          {children}
        </div>
        {trailing}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 px-1">{error}</p>}
    </div>
  );
}

function SocialButton({ onClick, disabled, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
      <span className="text-left leading-tight">
        <span className="block text-[10px] text-slate-500">Continuar con</span>
        <span className="block text-sm font-bold text-slate-900">{label}</span>
      </span>
    </button>
  );
}

const fieldInputClass =
  "w-full bg-transparent border-none outline-none p-0 text-base text-slate-900 placeholder-slate-300";

export default function LoginView() {
  const {
    email,
    password,
    setEmail,
    setPassword,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
    alert,
    handleCloseAlert,
    isSubmitting,
  } = useLoginController();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isRegister = mode === "register";

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");
    setErrors({});
    setTouched({});
    handleCloseAlert();
  };

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Ingresa tu correo.";
    else if (!EMAIL_REGEX.test(email)) next.email = "Correo inválido.";

    if (!password) next.password = "Ingresa tu contraseña.";
    else if (isRegister && password.length < 6) next.password = "Mínimo 6 caracteres.";

    if (isRegister) {
      if (!name.trim()) next.name = "Ingresa tu nombre.";
      if (confirmPassword !== password) next.confirmPassword = "Las contraseñas no coinciden.";
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    setTouched({ email: true, password: true, name: true, confirmPassword: true });
    if (Object.keys(validation).length > 0) return;

    if (isRegister) {
      await registerWithEmail(name);
    } else {
      await loginWithEmail();
    }
  };

  const fieldError = (field) => (touched[field] ? errors[field] : "");

  const AlertStyle = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
  const AlertIcon = AlertStyle.icon;

  const alertBanner = alert.open && (
    <div className={`mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border text-sm ${AlertStyle.box}`}>
      <AlertIcon size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1">{alert.message}</p>
      <button
        type="button"
        onClick={handleCloseAlert}
        aria-label="Cerrar"
        className="cursor-pointer shrink-0 p-0.5 -m-0.5 rounded-full hover:bg-black/5 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="cursor-pointer shrink-0 text-slate-400 hover:text-slate-600"
      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  const resetForm = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <button
          type="button"
          onClick={() => setShowResetForm(false)}
          className="cursor-pointer p-1.5 -m-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-900">Recuperar contraseña</h2>
      </div>
      <p className="text-sm text-slate-500">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <FieldBox icon={Mail} label="Correo electrónico">
        <input
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          className={fieldInputClass}
          placeholder="ejemplo@correo.com"
          autoComplete="email"
        />
      </FieldBox>
      <button
        type="button"
        disabled={isSubmitting || !resetEmail.trim()}
        onClick={async () => {
          const success = await resetPassword(resetEmail);
          if (success) setTimeout(() => setShowResetForm(false), 3000);
        }}
        className="cursor-pointer w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        Enviar correo de recuperación
      </button>
    </div>
  );

  const mainForm = (
    <>
      <h2 className="text-2xl font-extrabold text-slate-900 text-center">
        {isRegister ? "Crea tu cuenta" : "¡Bienvenido de vuelta!"}
      </h2>
      <p className="text-slate-500 text-center text-sm mt-1.5 mb-6">
        {isRegister
          ? "Regístrate y empieza a construir tus metas financieras."
          : "Inicia sesión y sigue construyendo tus metas financieras."}
      </p>

      <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
        {isRegister && (
          <FieldBox icon={User} label="Nombre" error={fieldError("name")}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              className={fieldInputClass}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </FieldBox>
        )}

        <FieldBox icon={Mail} label="Correo electrónico" error={fieldError("email")}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            className={fieldInputClass}
            placeholder="ejemplo@correo.com"
            autoComplete="email"
          />
        </FieldBox>

        <FieldBox icon={Lock} label="Contraseña" error={fieldError("password")} trailing={passwordToggle}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            className={fieldInputClass}
            placeholder="••••••••"
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </FieldBox>

        {isRegister && (
          <FieldBox icon={Lock} label="Confirmar contraseña" error={fieldError("confirmPassword")}>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              className={fieldInputClass}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </FieldBox>
        )}

        {!isRegister && (
          <div className="text-right !mt-2">
            <button
              type="button"
              onClick={() => {
                setShowResetForm(true);
                setResetEmail(email);
              }}
              className="cursor-pointer text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer relative w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed !mt-5"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          {!isSubmitting && <ArrowRight size={18} className="absolute right-5" />}
        </button>
      </form>

      <div className="flex items-center my-5">
        <div className="flex-grow h-px bg-slate-200" />
        <span className="text-slate-400 mx-3 text-xs">o continúa con</span>
        <div className="flex-grow h-px bg-slate-200" />
      </div>

      <SocialButton onClick={loginWithGoogle} disabled={isSubmitting} icon={<FcGoogle size={20} />} label="Google" />

      <p className="text-center text-sm text-slate-500 mt-6">
        {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="cursor-pointer text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
        >
          {isRegister ? "Inicia sesión" : "Regístrate"} →
        </button>
      </p>
    </>
  );

  const devCredits = (
    <div className="mt-6 text-xs text-center text-slate-400 space-y-0.5">
      <p>
        Desarrollado por <span className="text-slate-600 font-semibold">Sebastian Londoño</span>
      </p>
    </div>
  );

  return (
    <>
      {/* Mobile: pantalla clara fija, con ilustración e insignia de confianza */}
      <div className="md:hidden min-h-screen w-full bg-gradient-to-b from-emerald-50 via-white to-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-100/70 pointer-events-none" />
        <div className="absolute top-14 left-14 w-20 h-20 rounded-full bg-emerald-50 pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-[140%] h-64 rounded-[50%] bg-emerald-100/60 pointer-events-none" />
        <div className="absolute -bottom-44 -left-16 w-[140%] h-64 rounded-[50%] bg-emerald-200/50 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md mx-auto px-6 pt-12 pb-10">
          <div className="flex flex-col items-center text-center mb-2">
            {/* <img src={appIcon} alt="" className="w-24 h-24 mb-2" /> */}
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="text-slate-800">Coin</span>
              <span className="text-emerald-600">Control</span>
            </h1>
            <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-1.5">
              Tu dinero, tus decisiones
            </p>
          </div>

          {!showResetForm && (
            <img
              src={loginIllustration}
              alt=""
              className="w-full max-w-[280px] mx-auto mb-4 select-none pointer-events-none"
            />
          )}

          {alertBanner}
          {showResetForm ? resetForm : mainForm}

          {devCredits}
        </div>
      </div>

      {/* Desktop: split-screen, marca a la izquierda, form a la derecha */}
      <div className="hidden md:flex min-h-screen w-full bg-white">
        <div className="w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a1f1a] to-[#0d2b22] text-white flex flex-col items-center justify-center text-center p-12">
          <div className="absolute top-[-15%] right-[-10%] w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full bg-teal-400/10 blur-3xl" />
          <img src={nordwareLogo} alt="Nørdware" className="absolute top-6 right-6 h-6 opacity-70" />

          <img src={appIcon} alt="" className="w-20 h-20 mb-4 relative z-10 brightness-0 invert" />
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 relative z-10">CoinControl</h1>
          <p className="text-white/60 text-sm md:text-base max-w-xs relative z-10">
            Controla tus ingresos y gastos fácilmente
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-center p-12 overflow-y-auto">
          <div className="w-full max-w-sm">
            {alertBanner}
            {showResetForm ? resetForm : mainForm}
            {devCredits}
          </div>
        </div>
      </div>
    </>
  );
}
