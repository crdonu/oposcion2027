// Raíz de composición: aquí se eligen las implementaciones concretas de los puertos.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { AuthService, DataRepository } from './application/ports';
import { App } from './presentation/App';
import { LocalStorageRepository } from './infrastructure/LocalStorageRepository';
import { PasswordAuth } from './infrastructure/PasswordAuth';
import { FIREBASE_CONFIG, FIREBASE_EMAIL, PASSWORD_SHA256, SESSION_KEY, STORAGE_KEY } from './config';
import './presentation/styles.css';

async function compose(): Promise<{ auth: AuthService; repository: DataRepository; cloud: boolean }> {
  const local = new LocalStorageRepository(STORAGE_KEY);
  if (FIREBASE_CONFIG && FIREBASE_EMAIL) {
    // Carga diferida: el código de Firebase solo se descarga si se usa.
    const [{ createFirebase }, { FirebaseAuth }, { FirestoreRepository }] = await Promise.all([
      import('./infrastructure/firebase/createFirebase'),
      import('./infrastructure/firebase/FirebaseAuth'),
      import('./infrastructure/firebase/FirestoreRepository'),
    ]);
    const { auth, db } = createFirebase(FIREBASE_CONFIG);
    return { auth: new FirebaseAuth(auth, FIREBASE_EMAIL), repository: new FirestoreRepository(db, auth, local), cloud: true };
  }
  return { auth: new PasswordAuth(PASSWORD_SHA256, SESSION_KEY), repository: local, cloud: false };
}

compose().then(({ auth, repository, cloud }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App auth={auth} repository={repository} cloud={cloud} />
    </StrictMode>,
  );
});
