import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapsApp } from "./MapsApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapsApp />
  </StrictMode>
);
