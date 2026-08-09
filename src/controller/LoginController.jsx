import { useRef, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export function useLoginController() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ open: false, type: "info", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const alertTimerRef = useRef(null);

  const handleCloseAlert = () => {
    clearTimeout(alertTimerRef.current);
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const showAlert = (type, message, duration = 4500) => {
    clearTimeout(alertTimerRef.current);
    setAlert({ open: true, type, message });
    alertTimerRef.current = setTimeout(handleCloseAlert, duration);
  };

  const getErrorMessage = (code) => {
    const messages = {
      "auth/invalid-email": "El correo no es válido.",
      "auth/missing-password": "Debes ingresar una contraseña.",
      "auth/wrong-password": "La contraseña es incorrecta.",
      "auth/invalid-credential": "Correo o contraseña incorrectos.",
      "auth/user-not-found": "No se encontró una cuenta con ese correo.",
      "auth/email-already-in-use": "Este correo ya está registrado.",
      "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
      "auth/popup-closed-by-user": "Cierre inesperado. Intenta de nuevo.",
      "auth/missing-email": "Debes ingresar un correo electrónico.",
      "auth/too-many-requests": "Demasiados intentos. Espera un momento e intenta de nuevo.",
      "auth/operation-not-allowed": "Este método de inicio de sesión no está habilitado todavía.",
      "auth/account-exists-with-different-credential":
        "Ya existe una cuenta con ese correo usando otro método de acceso.",
    };
    return messages[code] || "Ocurrió un error. Intenta nuevamente.";
  };

  // Pequeña pausa antes de navegar para que el toast de éxito alcance a verse.
  const navigateAfterSuccess = (path) => {
    setTimeout(() => navigate(path), 900);
  };

  const loginWithEmail = async () => {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showAlert("success", "Inicio de sesión exitoso");
      navigateAfterSuccess("/home");
    } catch (error) {
      showAlert("error", getErrorMessage(error.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerWithEmail = async (name) => {
    setIsSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name?.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      showAlert("success", "Registro exitoso");
      navigateAfterSuccess("/home");
    } catch (error) {
      showAlert("error", getErrorMessage(error.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showAlert("success", "Inicio de sesión con Google exitoso");
      navigateAfterSuccess("/home");
    } catch (error) {
      showAlert("error", getErrorMessage(error.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async (resetEmailValue) => {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmailValue);
      showAlert("success", "Se ha enviado un correo para restablecer tu contraseña");
      return true;
    } catch (error) {
      showAlert("error", getErrorMessage(error.code));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
