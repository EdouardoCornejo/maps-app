import { useContext, useLayoutEffect, useRef } from "react";
import { PlacesContext } from "../context";
import { Loading } from "./Loading";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const MapView = () => {
  const { isLoading, userLocation } = useContext(PlacesContext);
  const mapDiv = useRef<HTMLDivElement>(null);

   useLayoutEffect(() => {
    if (!isLoading && mapDiv.current) {
      const map = new mapboxgl.Map({
        container: mapDiv.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: userLocation,
        zoom: 9,
      });

      return () => map.remove();
    }
  }, [isLoading]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      ref={mapDiv}
      style={{
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
    </div>
  );
};
