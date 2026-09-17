# CANCHA — Catálogo de ropa urbana juvenil

Catálogo web para una tienda de ropa juvenil, hecho con **React + Vite**, con
todos los datos guardados en el propio navegador usando **IndexedDB** (con
respaldo automático en **localStorage** por si el navegador no soporta
IndexedDB). No necesita servidor ni base de datos externa: todo funciona en
local y también se puede publicar gratis en Netlify.

## Qué incluye

**Vista de tienda (para tus clientes)**
- Grilla de productos con imagen, precio, tallas y colores
- Buscador y filtros por categoría y talla
- Orden por precio o por más recientes
- Insignias de "Nuevo" y "Oferta", y aviso de "últimas unidades" o "agotado"
- Vista rápida del producto con el detalle de existencias por talla
- Diseño responsivo, pensado primero para celular

**Panel de administración (para ti)**
- Botón "Admin" en la barra superior para entrar al panel
- Añadir, editar y eliminar productos
- Edición rápida de precio, precio de oferta y stock por talla directo en la tabla
- Formulario completo: nombre, categoría (o crear una nueva), descripción,
  precio, oferta, colores, tallas con su stock, e imagen (puedes subir una
  foto desde tu computadora o celular; se guarda dentro del catálogo)
- Estadísticas: total de productos, unidades en stock, valor del inventario,
  productos con poco stock y productos agotados
- Exportar el catálogo completo a un archivo `.json` (respaldo manual) e
  importarlo de nuevo cuando quieras

Los datos se guardan **en el dispositivo/navegador donde se usa la app**. Si
quieres que el mismo catálogo se vea igual en varias computadoras, usa
"Exportar" en una y "Importar" en la otra.

## Ejecutar en tu computadora

Necesitas tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

```bash
npm install
npm run dev
```

Abre la dirección que aparece en la terminal (normalmente `http://localhost:5173`).

## Publicar en Netlify

**Opción 1 — arrastrar y soltar (la más simple)**
1. Corre `npm run build`. Esto crea una carpeta `dist/`.
2. Entra a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta `dist`.
3. Netlify te da un enlace público al instante.

**Opción 2 — conectando tu repositorio**
1. Sube este proyecto a GitHub (u otro proveedor).
2. En Netlify, "Add new site" → "Import an existing project".
3. Build command: `npm run build` — Publish directory: `dist`
   (esto ya viene configurado en `netlify.toml`, Netlify lo detecta solo).

## Personalizar la tienda

- **Nombre de la tienda, moneda y tallas:** edita `src/config.js`.
- **Productos de ejemplo iniciales:** edita `src/data/seedProducts.js`
  (solo se usan la primera vez que se abre la app, con el catálogo vacío).
- **Colores y tipografía:** variables CSS al inicio de `src/index.css`
  (`--ink`, `--paper`, `--cobalt`, `--lime`, `--coral`).

## Estructura del proyecto

```
src/
  config.js              Nombre de tienda, categorías, tallas, helpers
  data/seedProducts.js   Catálogo de ejemplo inicial
  db/database.js         Guardado en IndexedDB + respaldo en localStorage
  hooks/useProducts.js   Estado del catálogo y operaciones (crear/editar/borrar)
  components/            Tienda: Hero, filtros, grilla, tarjeta, vista rápida
  components/admin/      Panel admin: tabla, formulario de producto
```
