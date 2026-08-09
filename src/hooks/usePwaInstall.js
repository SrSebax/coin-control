import { useCallback, useSyncExternalStore } from "react";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const isIOSDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const listeners = new Set();
let deferredPrompt = null;
let installed = isStandalone();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// useSyncExternalStore exige que getSnapshot devuelva la MISMA referencia
// mientras no cambie el valor real (si no, loop infinito de renders). Por
// eso son dos snapshots separados devolviendo primitivos/referencias
// estables, en vez de un objeto nuevo `{ deferredPrompt, installed }` en
// cada llamada.
function getPromptSnapshot() {
  return deferredPrompt;
}

function getInstalledSnapshot() {
  return installed;
}

// Chrome dispara `beforeinstallprompt` una sola vez, apenas carga la página —
// si nadie escucha en ese momento el evento se pierde para siempre en esa
// sesión. Por eso el listener vive a nivel de módulo (corre apenas se carga
// este archivo) y no dentro del hook, que sólo se monta cuando el usuario
// navega a Configuración.
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  emitChange();
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  installed = true;
  emitChange();
});

// Instalar la PWA en la pantalla de inicio del celular. `beforeinstallprompt`
// es una API nativa del navegador (Chrome/Edge/Android) independiente del
// service worker que registra vite-plugin-pwa; en iOS Safari no existe, así
// que ahí sólo se puede guiar al usuario a instalar a mano.
export function usePwaInstall() {
  const prompt = useSyncExternalStore(subscribe, getPromptSnapshot);
  const isInstalled = useSyncExternalStore(subscribe, getInstalledSnapshot);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    emitChange();
  }, []);

  return {
    isInstalled,
    isInstallable: !isInstalled && !!prompt,
    isIOS: !isInstalled && isIOSDevice(),
    promptInstall,
  };
}
