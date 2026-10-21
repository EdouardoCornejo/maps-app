import { useContext, useLayoutEffect, useRef } from "react";
import { MapContext, PlacesContext } from "../context";
import { Loading } from "./Loading";
import { mapboxStyle } from "../constant";
import { getMapboxToken } from "../utils";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = getMapboxToken();

export const MapView = () => {
  const { isLoading, userLocation } = useContext(PlacesContext);
  const { setMap } = useContext(MapContext);
  const mapDiv = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isLoading && mapDiv.current) {
      const map = new mapboxgl.Map({
        container: mapDiv.current,
        style: mapboxStyle,
        center: userLocation,
        zoom: 9,
      });

      setMap(map);

      return () => map.remove();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    />
  );
};
