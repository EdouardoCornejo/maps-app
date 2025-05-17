import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapsApp } from "./MapsApp";

if (!navigator.geolocation) {
  alert("Geolocation is not supported by this browser.");
  throw new Error("Geolocation is not supported by this browser.");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapsApp />
  </StrictMode>
);
