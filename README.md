# Oposición 2027

Aplicación web para organizar la oposición de Servicios a la Comunidad (Madrid). React + TypeScript + Vite, publicada en GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev
```

Contraseña provisional: `oposicion2027` (se cambia en `src/config.ts`).

## Arquitectura (clean architecture)

```
src/
  domain/          Tipos y reglas puras (fichas, tareas, progreso, fechas). Sin dependencias.
  application/     Casos de uso (funciones puras sobre AppData), puertos y datos iniciales.
  infrastructure/  Adaptadores: almacenamiento (LocalStorageRepository) y acceso (PasswordAuth).
  presentation/    React: estado, componentes y páginas.
  main.tsx         Raíz de composición: elige qué adaptador implementa cada puerto.
```

Las dependencias van siempre hacia dentro: `presentation → application → domain`; `infrastructure` implementa los puertos de `application`. Para pasar a una base de datos en la nube basta con un nuevo adaptador de `DataRepository` y cambiar una línea en `main.tsx`.

## Publicación

Cada push a `main` publica la web con GitHub Actions (`.github/workflows/deploy.yml`). En el repositorio: Settings → Pages → Source: **GitHub Actions**.

## Base de datos (Firebase)

Sin configurar, la app funciona en modo local (datos en el navegador). Para sincronizar entre aparatos:

1. En <https://console.firebase.google.com> crea un proyecto (sin Google Analytics).
2. **Authentication → Comenzar → Correo electrónico/contraseña**: actívalo. En **Usuarios → Agregar usuario**, crea la cuenta (puede ser un correo inventado, p. ej. `oposicion@mi-app.local`) con la contraseña de acceso.
3. **Firestore Database → Crear base de datos** (ubicación `eur3` u otra europea, modo producción). En **Reglas**, pega el contenido de `firestore.rules` y publica.
4. **Configuración del proyecto → Tus apps → Web (`</>`)**: registra la app y copia el objeto `firebaseConfig`.
5. **Authentication → Configuración → Dominios autorizados**: añade `TU-USUARIO.github.io`.
6. Pega `firebaseConfig` en `FIREBASE_CONFIG` y el correo en `FIREBASE_EMAIL` (`src/config.ts`).

La primera vez que entres con Firebase, lo que tuvieras guardado en ese navegador se sube a la nube.
