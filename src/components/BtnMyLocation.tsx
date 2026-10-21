import { useContext } from "react";
import { MapContext, PlacesContext } from "../context";

export const BtnMyLocation = () => {
  const { map, isMapReady } = useContext(MapContext);
  const { userLocation, isDefaultLocation } = useContext(PlacesContext);

  const onClick = () => {
    if (!isMapReady || !userLocation) return;
    map?.flyTo({
      zoom: 14,
      center: userLocation,
    });
  };

  if (isDefaultLocation) return null;

  return (
    <button
      className="btn btn-primary"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 999,
      }}
      onClick={onClick}
    >
      Mi Ubicacion
    </button>
  );
};
