// Configuración de la aplicación.
import type { FirebaseOptions } from 'firebase/app';

/**
 * Configuración web de Firebase (Consola de Firebase → Configuración del proyecto →
 * Tus apps → Web). No es secreta: la protección real son las reglas de Firestore
 * (firestore.rules) y la contraseña de la cuenta.
 * Mientras esté a null, la aplicación funciona en modo local (datos en el navegador).
 */
export const FIREBASE_CONFIG: FirebaseOptions | null = {
  apiKey: 'AIzaSyB3A7fZxfI2rxCmc_vXlmTAOQM6yh261X4',
  authDomain: 'oposicion-b3133.firebaseapp.com',
  projectId: 'oposicion-b3133',
  storageBucket: 'oposicion-b3133.firebasestorage.app',
  messagingSenderId: '29155558616',
  appId: '1:29155558616:web:967d5c8756000cd63443ad',
};

/**
 * Solo en modo local: huella SHA-256 de la contraseña provisional "oposicion2027".
 *   node -e "console.log(require('crypto').createHash('sha256').update('NUEVA').digest('hex'))"
 */
export const PASSWORD_SHA256 = '8a9266cadbfd383bcc14df0176d4c6f8520ace0a7141fcc0a02a023b320effc8';

export const STORAGE_KEY = 'oposicion-app:data';
export const SESSION_KEY = 'oposicion-app:session';
