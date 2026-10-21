/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_MAPBOX_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
