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
