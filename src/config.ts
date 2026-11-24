// Configuración de la aplicación.

/**
 * Huella SHA-256 de la contraseña de acceso (no la contraseña en claro).
 * Contraseña provisional: "oposicion2027". Para cambiarla:
 *   node -e "console.log(require('crypto').createHash('sha256').update('NUEVA').digest('hex'))"
 */
export const PASSWORD_SHA256 = '8a9266cadbfd383bcc14df0176d4c6f8520ace0a7141fcc0a02a023b320effc8';

export const STORAGE_KEY = 'oposicion-app:data';
export const SESSION_KEY = 'oposicion-app:session';
