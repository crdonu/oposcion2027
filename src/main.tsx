// Raíz de composición: aquí se eligen las implementaciones concretas de los puertos.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './presentation/App';
import { LocalStorageRepository } from './infrastructure/LocalStorageRepository';
import { PasswordAuth } from './infrastructure/PasswordAuth';
import { PASSWORD_SHA256, SESSION_KEY, STORAGE_KEY } from './config';
import './presentation/styles.css';

const repository = new LocalStorageRepository(STORAGE_KEY);
const auth = new PasswordAuth(PASSWORD_SHA256, SESSION_KEY);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App auth={auth} repository={repository} />
  </StrictMode>,
);
