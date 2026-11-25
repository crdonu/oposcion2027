// Instalación como aplicación (PWA): registra el service worker y guarda
// el aviso de instalación del navegador para ofrecerlo desde Ajustes.

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function setupPwa(): void {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          // Busca versión nueva al abrir la app y cada vez que vuelve a primer plano.
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') void reg.update().catch(() => {});
          });
        })
        .catch(() => { /* sin instalación offline */ });
    });
    actualizarAlCambiarVersion();
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

/**
 * Cuando se instala una versión nueva, recarga la app para mostrarla.
 * Si llega al abrirla (primeros segundos), recarga en el acto; si llega mientras
 * se está usando, espera a que la app vuelva a primer plano para no cortar lo que
 * se está escribiendo.
 */
function actualizarAlCambiarVersion(): void {
  const habiaVersion = Boolean(navigator.serviceWorker.controller);
  const inicio = Date.now();
  let pendiente = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!habiaVersion) return; // primera instalación: ya se ve la última versión
    if (Date.now() - inicio < 10_000 || document.visibilityState === 'hidden') window.location.reload();
    else pendiente = true;
  });
  document.addEventListener('visibilitychange', () => {
    if (pendiente && document.visibilityState === 'visible') window.location.reload();
  });
}

export const pwa = {
  canInstall: () => deferred !== null,
  isInstalled: () => window.matchMedia('(display-mode: standalone)').matches,
  async install(): Promise<boolean> {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    notify();
    return outcome === 'accepted';
  },
  subscribe(l: () => void): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
