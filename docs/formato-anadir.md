# Cómo preparar un archivo para «Añadir desde un archivo»

La app (Ajustes → Añadir desde un archivo) suma lo que venga en el archivo a lo que ya hay. No borra ni cambia nada. Antes de añadir enseña una vista previa y guarda una copia para poder deshacer.

El archivo es un JSON con esta forma (todo es opcional salvo `"tipo"`):

```json
{
  "tipo": "oposicion-anadir",
  "fichas": [
    {
      "kind": "apartado",
      "numero": 5,
      "pasos": ["Texto del paso"],
      "notas": ["**Título en negrita**\n- viñeta\n- otra viñeta"],
      "enlaces": [{ "titulo": "Nombre", "url": "https://..." }]
    }
  ],
  "tareas": [
    { "titulo": "Qué hay que hacer", "fecha": "2026-11-30", "tipo": "programacion", "ficha": { "kind": "apartado", "numero": 5 } }
  ],
  "requisitos": [
    { "grupo": "contenido", "texto": "Texto del requisito" }
  ]
}
```

- `kind`: `tema`, `caso`, `apartado` (de la programación) o `unidad` (didáctica). `numero`: el número que se ve en la tarjeta.
- Tareas: `fecha` en formato `AAAA-MM-DD`. `tipo` (opcional): `tema`, `caso`, `programacion` u `otro`; si se omite y hay `ficha`, se deduce. `ficha` (opcional) la relaciona con una tarjeta.
- Requisitos: `grupo` es `contenido` o `formato`.
- Notas: `**texto**` es negrita y una línea que empieza por `- ` es una viñeta.
- No se repite nada que ya exista (mismo texto en la misma ficha, misma tarea el mismo día, mismo enlace).

Ejemplo completo: `docs/ejemplo-anadir.json`.
