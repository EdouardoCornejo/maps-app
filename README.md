# Maps App

Aplicación de mapas hecha con React, TypeScript y Mapbox GL. Muestra tu ubicación, permite buscar lugares y trazar la ruta hacia ellos.

## Funcionalidades

- Mapa interactivo con Mapbox GL
- Ubicación del usuario (con ubicación por defecto si no se comparte)
- Búsqueda de lugares
- Rutas en auto hacia el lugar seleccionado

## Stack

React 19 · TypeScript · Vite · Mapbox GL · Axios

## Instalación

```bash
yarn install
cp .env.template .env   # agrega tu token público de Mapbox (pk.)
yarn dev
```

## Scripts

| Comando        | Descripción                  |
| -------------- | ---------------------------- |
| `yarn dev`     | Servidor de desarrollo       |
| `yarn build`   | Build de producción          |
| `yarn preview` | Previsualiza el build        |
| `yarn lint`    | Revisa el código con ESLint  |

## Notas

- Usa solo tokens públicos (`pk.`); el token queda visible en el navegador. En producción, restríngelo a tu dominio desde [Mapbox](https://account.mapbox.com/access-tokens/).
- Desplegado en Vercel (`vercel.json` define los headers de seguridad).
