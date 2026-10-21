import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapsApp } from "./MapsApp";
import { getMapboxToken } from "./utils";

// Fail fast with a clear message if the config is missing or the token is not public
getMapboxToken();
if (!import.meta.env.VITE_MAPBOX_API) {
  throw new Error(
    "Falta VITE_MAPBOX_API: copia .env.template a .env y completa los valores."
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapsApp />
  </StrictMode>
);
