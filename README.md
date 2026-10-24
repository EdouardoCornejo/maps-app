# Maps App

Aplicación de mapas hecha con **React 19, TypeScript y Mapbox GL**. Detecta **tu ubicación**, permite **buscar lugares** cercanos y **trazar la ruta en auto** hasta cualquiera de ellos sobre un mapa oscuro a pantalla completa. El estado se organiza con **Context API + `useReducer`**, y el proyecto cuida el uso de la API: solo acepta **tokens públicos**, **redacta el token de los logs**, **cachea rutas** y aplica un **límite diario de rutas por navegador**.

**Demo:** https://maps-app-pi.vercel.app

![Tech](https://img.shields.io/badge/React-19-61DAFB)
![Tech](https://img.shields.io/badge/TypeScript-6-3178C6)
![Tech](https://img.shields.io/badge/Vite-8-646CFF)
![Tech](https://img.shields.io/badge/Mapbox_GL-3-000000)
![Tech](https://img.shields.io/badge/Axios-HTTP-5A29E4)
![Tech](https://img.shields.io/badge/Bootstrap-5-7952B3)

---

## Tabla de contenidos

- [Maps App](#maps-app)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Qué hace el proyecto](#qué-hace-el-proyecto)
  - [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
    - [Requisitos](#requisitos)
    - [Variables de entorno](#variables-de-entorno)
    - [Instalación y scripts](#instalación-y-scripts)
    - [Despliegue](#despliegue)
  - [Uso](#uso)
  - [Cómo funciona](#cómo-funciona)
    - [1. `src/main.tsx` y `src/utils/mapboxToken.ts`](#1-srcmaintsx-y-srcutilsmapboxtokents)
    - [2. `src/apis/`](#2-srcapis)
    - [3. `src/context/places/`](#3-srccontextplaces)
    - [4. `src/context/map/`](#4-srccontextmap)
    - [5. `src/utils/routeQuota.ts` y `src/utils/routeErrors.ts`](#5-srcutilsroutequotats-y-srcutilsrouteerrorsts)
    - [6. Componentes](#6-componentes)
    - [7. `vite.config.ts` y `vercel.json`](#7-viteconfigts-y-verceljson)
    - [Flujo de la aplicación](#flujo-de-la-aplicación)
  - [Tecnologías](#tecnologías)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Personalización](#personalización)
  - [Licencia](#licencia)

---

## Qué hace el proyecto

- **Mapa interactivo** a pantalla completa con Mapbox GL (estilo `dark-v11`).
- **Geolocalización** del usuario con un marcador _"Aquí estoy"_; si el navegador no la permite, la rechaza o tarda más de 15 s, usa una **ubicación por defecto** (Ciudad de México) sin marcador.
- Botón **Mi Ubicacion** para volver a centrar el mapa (oculto cuando se usa la ubicación por defecto).
- **Búsqueda de lugares** con _debounce_ de 350 ms, hasta 5 resultados en español, priorizando los cercanos a tu posición.
- Un **marcador con popup** por cada resultado; al hacer clic en un resultado el mapa vuela hasta él.
- **Ruta en auto** (botón **Direcciones**) dibujada como línea sobre el mapa, con ajuste automático del encuadre.
- **Caché de rutas** (hasta 50) y **límite de 10 rutas por día** por navegador para proteger el plan gratuito.
- **Mensajes de error claros** en un modal accesible (sin ruta posible, destino demasiado lejos, token rechazado, límite de peticiones, sin conexión…).
- **Seguridad**: solo tokens públicos `pk.`, token redactado en logs, popups construidos con nodos DOM (sin HTML de la API) y CSP estricta.

---

## Cómo ejecutar el proyecto

### Requisitos

- **Node.js 20.19+ o 22.12+** (requerido por Vite 8).
- **Yarn** (el repositorio incluye `yarn.lock`).
- Un **token público** de Mapbox (`pk.`): https://account.mapbox.com/access-tokens/

### Variables de entorno

```bash
cp .env.template .env
```

| Variable            | Descripción                                    | Valor de ejemplo            |
| ------------------- | ---------------------------------------------- | --------------------------- |
| `VITE_MAPBOX_TOKEN` | Token **público** de Mapbox (debe empezar por `pk.`) | `your_mapbox_token_here` |
| `VITE_MAPBOX_API`   | URL base de la API de Mapbox                   | `https://api.mapbox.com/`   |

Si falta alguna variable o el token no es público, la app **falla al arrancar** con un mensaje explicativo.

> El token queda visible en el navegador (todas las variables `VITE_` se incrustan en el bundle). Usa solo tokens `pk.` y, en producción, **restríngelo a tu dominio** desde el panel de Mapbox.

### Instalación y scripts

```bash
yarn install
yarn dev
```

| Comando        | Descripción                                               |
| -------------- | --------------------------------------------------------- |
| `yarn dev`     | Servidor de desarrollo                                    |
| `yarn build`   | Comprobación de tipos (`tsc -b`) y build de producción    |
| `yarn preview` | Previsualiza el build                                     |
| `yarn lint`    | Revisa el código con ESLint                               |

### Despliegue

Desplegado en **Vercel**. Las variables se configuran en el proyecto de Vercel; `.vercelignore` evita subir los `.env` locales y `vercel.json` define las cabeceras de seguridad.

---

## Uso

1. Acepta (o rechaza) el permiso de ubicación. Mientras se resuelve se muestra _"Espere por favor — Localizando..."_.
2. Escribe en **Buscar lugar...** (arriba a la izquierda); los resultados aparecen debajo y como marcadores en el mapa.
3. Haz clic en un resultado para **volar hasta él**.
4. Pulsa **Direcciones** para trazar la ruta en auto desde tu ubicación.
5. Usa **Mi Ubicacion** (arriba a la derecha) para volver a tu posición.
6. Borra el texto de búsqueda para limpiar los resultados.

---

## Cómo funciona

### 1. `src/main.tsx` y `src/utils/mapboxToken.ts`

`main.tsx` valida la configuración antes de renderizar: llama a `getMapboxToken()` y comprueba `VITE_MAPBOX_API`.

- `getMapboxToken()`: único punto de lectura del token; exige que exista, que empiece por `pk.` y que cumpla `PUBLIC_TOKEN_REGEX`. Rechaza explícitamente tokens secretos (`sk.`).
- `redactToken(text)`: sustituye cualquier token (`pk.`/`sk.`/`tk.`) y el parámetro `access_token=` por `[REDACTED]`.
- `toSafeError(error)`: versión segura para logs de un error (en errores de axios solo conserva mensaje y estado, porque la config de la petición lleva el token).

### 2. `src/apis/`

Dos instancias de axios configuradas con `VITE_MAPBOX_API` + `mapboxEndpoints`:

- **`searchApi`** (`geocoding/v5/mapbox.places/`): `limit: 5`, `language: 'es'`.
- **`directionsApi`** (`directions/v5/mapbox/driving`): sin alternativas, geometría `geojson`, `overview: simplified`, sin pasos.

### 3. `src/context/places/`

`PlacesProvider` + `placesReducer` gestionan `userLocation`, `isDefaultLocation`, `isLoading`, `isLoadingPlaces` y `places`.

- Al montar llama a `getUserLocation()` (`src/helpers/getUserLocation.ts`), una promesa sobre `navigator.geolocation.getCurrentPosition` con un temporizador propio de 15 s (`MAX_WAIT_MS`), porque el `timeout` nativo no corre mientras el aviso de permiso está abierto. Si falla, despacha `setDefaultLocation` con `DEFAULT_LOCATION`.
- `searchPlacesByTerm(query)`: con texto vacío limpia los lugares; si no, llama a `searchApi` con la consulta codificada (`encodeURIComponent`) y `proximity` = ubicación del usuario.

### 4. `src/context/map/`

`MapProvider` + `mapReducer` guardan la instancia del mapa, `isMapReady` y los marcadores.

- `setMap(map)`: en el evento `load` añade el marcador _"Aquí estoy"_ (solo si la ubicación es real) y despacha `setMap`.
- Un `useEffect([places, state.map])` elimina los marcadores anteriores y crea uno con popup por cada lugar.
- `createPopupContent(title, description)`: construye el popup con `textContent` para que el texto de la API nunca se interprete como HTML (XSS).
- `fetchRoute(start, end)`: busca primero en `routeCache` (clave con 5 decimales, ~1 m); si no está, comprueba la cuota, la consume y llama a `directionsApi`. Si `data.code !== "Ok"` lanza un `RouteError` con el mensaje de `directionsCodeMessages`. La caché expulsa la entrada más antigua al llegar a `MAX_CACHED_ROUTES`.
- `getRouteBetweenPoints(start, end)`: obtiene la ruta, ajusta el encuadre con `LngLatBounds` + `fitBounds` y (re)crea la fuente y la capa `RouteString` como línea `#61DAFB`.

### 5. `src/utils/routeQuota.ts` y `src/utils/routeErrors.ts`

- **Cuota**: `ROUTE_DAILY_LIMIT = 10` rutas por día y navegador, guardadas en `localStorage` (`maps-app:route-quota`) con la fecha local; si el storage está bloqueado usa un valor en memoria. `getRemainingRoutes()` y `consumeRoute()` la leen y actualizan. Es un límite de cortesía, no de seguridad: la protección real es el token restringido por URL.
- **Errores**: `RouteError` marca mensajes ya aptos para el usuario; `getRouteErrorMessage(error)` traduce errores de axios por estado (sin respuesta, `401`/`403`, `422`, `429`, `5xx`) a mensajes en español.

### 6. Componentes

- **`HomeScreen`**: compone `MapView`, `SearchBar`, `BtnMyLocation` y `ReactLogo`.
- **`MapView`**: muestra `Loading` mientras se resuelve la ubicación; después crea el `mapboxgl.Map` (zoom 9, centrado en el usuario) en un `useLayoutEffect` y lo elimina al desmontar.
- **`SearchBar`**: input con _debounce_ (`setTimeout` de 350 ms) que llama a `searchPlacesByTerm`.
- **`SearchResults`**: lista de lugares (resalta el activo), `flyTo` al hacer clic y botón **Direcciones** que llama a `getRouteBetweenPoints` y muestra los fallos en `ErrorModal`.
- **`ErrorModal`**: modal de Bootstrap renderizado con `createPortal` en `<body>`, con foco inicial en el botón y cierre con `Escape` o clic fuera.
- **`BtnMyLocation`**, **`Loading`**, **`LoadingPlaces`**, **`ReactLogo`**: botón de recentrado, pantallas de carga y logo.

### 7. `vite.config.ts` y `vercel.json`

- `vite.config.ts` separa `mapbox-gl` en su propio _chunk_ (`codeSplitting.groups` de Rolldown) para cachearlo a largo plazo, y sube `chunkSizeWarningLimit` a 2000 kB.
- `vercel.json` aplica una CSP que solo permite conectar con `api.mapbox.com` y `events.mapbox.com`, estilos de `cdn.jsdelivr.net` (Bootstrap), _workers_ `blob:` y `'wasm-unsafe-eval'` para Mapbox; `frame-ancestors` limitado a `'self'`, al portfolio y a `localhost:3000` / `localhost:3001`; `Permissions-Policy` con geolocalización solo para el propio origen, y caché inmutable para `/assets/*`.

### Flujo de la aplicación

```
main.tsx
  ├─ getMapboxToken()  + comprobación de VITE_MAPBOX_API   → error claro si falta config
  └─ <MapsApp>
       └─ <PlacesProvider>
            ├─ useEffect → getUserLocation()
            │                ├─ ok    → setUserLocation
            │                └─ error → setDefaultLocation(DEFAULT_LOCATION)
            └─ <MapProvider>
                 └─ <HomeScreen>
                      ├─ <MapView>        → new mapboxgl.Map() → setMap() → marcador "Aquí estoy"
                      ├─ <SearchBar>      → debounce 350 ms → searchPlacesByTerm()
                      │                                        → searchApi (proximity)
                      │                                        → places → marcadores + popups
                      │     └─ <SearchResults>
                      │           ├─ clic       → map.flyTo()
                      │           └─ Direcciones → getRouteBetweenPoints()
                      │                              └─ fetchRoute()
                      │                                   ├─ routeCache → hit
                      │                                   ├─ cuota agotada → RouteError
                      │                                   └─ directionsApi → capa "RouteString"
                      │                              error → <ErrorModal>
                      ├─ <BtnMyLocation>  → map.flyTo(userLocation)
                      └─ <ReactLogo>
```

---

## Tecnologías

- **React 19** — componentes funcionales, hooks, Context API y `useReducer`.
- **TypeScript 6** — interfaces tipadas para las respuestas de Geocoding y Directions (`src/interfaces/`).
- **Vite 8** (Rolldown) — servidor de desarrollo y build con _chunk_ separado para Mapbox.
- **Mapbox GL JS 3** — renderizado del mapa, marcadores, popups y capas.
- **Mapbox Geocoding y Directions APIs** — búsqueda de lugares y rutas en auto.
- **Axios** — instancias preconfiguradas para cada API.
- **Bootstrap 5** (CDN) — estilos de botones, listas, alertas y modal.
- **ESLint 10** + `typescript-eslint` + plugins de React Hooks y React Refresh.
- **Vercel** — despliegue y cabeceras de seguridad.

---

## Estructura del proyecto

```
maps-app/
├── public/
│   ├── apple-touch-icon.png
│   ├── favicon-32x32.png
│   ├── favicon.svg
│   └── icon-512.png
├── src/
│   ├── apis/
│   │   ├── directionsApi.ts       # Axios para Directions
│   │   ├── searchApi.ts           # Axios para Geocoding
│   │   └── index.ts
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── BtnMyLocation.tsx
│   │   ├── ErrorModal.tsx         # Modal accesible de errores de ruta
│   │   ├── Loading.tsx
│   │   ├── LoadingPlaces.tsx
│   │   ├── MapView.tsx            # Crea el mapa de Mapbox
│   │   ├── ReactLogo.tsx
│   │   ├── SearchBar.tsx          # Búsqueda con debounce
│   │   ├── SearchResults.tsx      # Resultados + botón Direcciones
│   │   └── index.ts
│   ├── constant/
│   │   ├── mapbox.ts              # Endpoints, estilo y ubicación por defecto
│   │   └── index.ts
│   ├── context/
│   │   ├── map/                   # MapContext, MapProvider, mapReducer
│   │   ├── places/                # PlacesContext, PlacesProvider, placesReducer
│   │   └── index.ts
│   ├── helpers/
│   │   ├── getUserLocation.ts     # Geolocalización con timeout propio
│   │   └── index.ts
│   ├── interfaces/
│   │   ├── directions.ts          # Tipos de la Directions API
│   │   ├── places.ts              # Tipos de la Geocoding API
│   │   └── index.ts
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   └── index.ts
│   ├── utils/
│   │   ├── mapboxToken.ts         # Validación y redacción del token
│   │   ├── routeErrors.ts         # Mensajes de error de rutas
│   │   ├── routeQuota.ts          # Límite diario de rutas
│   │   └── index.ts
│   ├── logo.svg
│   ├── main.tsx
│   ├── MapsApp.tsx
│   ├── styles.css
│   └── vite-env.d.ts              # Tipos de import.meta.env
├── .env.template
├── .vercelignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
└── yarn.lock
```

---

## Personalización

| Dónde                              | Constante            | Significado                                   | Valor actual                     |
| ---------------------------------- | -------------------- | --------------------------------------------- | -------------------------------- |
| `src/constant/mapbox.ts`           | `mapboxStyle`        | Estilo del mapa                               | `mapbox://styles/mapbox/dark-v11` |
| `src/constant/mapbox.ts`           | `DEFAULT_LOCATION`   | Ubicación `[lng, lat]` si no hay geolocalización | `[-99.1332, 19.4326]` (CDMX)  |
| `src/constant/mapbox.ts`           | `mapboxEndpoints`    | Rutas de Directions y Geocoding               | `driving` / `mapbox.places`      |
| `src/utils/routeQuota.ts`          | `ROUTE_DAILY_LIMIT`  | Rutas por día y navegador                     | `10`                             |
| `src/context/map/MapProvider.tsx`  | `MAX_CACHED_ROUTES`  | Rutas guardadas en caché                      | `50`                             |
| `src/helpers/getUserLocation.ts`   | `MAX_WAIT_MS`        | Espera máxima de geolocalización (ms)         | `15000`                          |
| `src/apis/searchApi.ts`            | `limit` / `language` | Resultados e idioma de la búsqueda            | `5` / `'es'`                     |
| `src/components/SearchBar.tsx`     | _debounce_           | Retardo antes de buscar (ms)                  | `350`                            |

---

## Licencia

Proyecto de uso libre con fines educativos y de práctica.
