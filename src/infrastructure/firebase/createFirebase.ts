import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

export function createFirebase(options: FirebaseOptions) {
  const app = initializeApp(options);
  const auth = getAuth(app);
  // Caché local persistente: la app funciona sin conexión y sincroniza al volver.
  const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  return { auth, db };
}
