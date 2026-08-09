import { useSyncExternalStore } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

// Store a nivel de módulo: un solo listener de auth compartido por toda la
// app (arranca apenas se carga este archivo, no cuando se monta el primer
// componente). Antes cada pantalla creaba su propio onAuthStateChanged, así
// que "user" arrancaba en null en cada mount y la foto de perfil / iniciales
// parpadeaban cada vez que navegabas.
let cachedUser = null;
let cachedAuthLoading = true;
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getUserSnapshot() {
  return cachedUser;
}

function getAuthLoadingSnapshot() {
  return cachedAuthLoading;
}

onAuthStateChanged(auth, (currentUser) => {
  cachedUser = currentUser;
  cachedAuthLoading = false;
  emitChange();
});

export function useCurrentUser() {
  const user = useSyncExternalStore(subscribe, getUserSnapshot);
  const authLoading = useSyncExternalStore(subscribe, getAuthLoadingSnapshot);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "";

  return { user, authLoading, displayName };
}
