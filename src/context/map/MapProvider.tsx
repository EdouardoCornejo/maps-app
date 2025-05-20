import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "./MapContext";
import { useReducer, type JSX } from "react";
import { mapReducer } from "./mapReducer";

export interface MapState {
  isMapReady: boolean;
  map?: MapboxMap;
}

const INITIAL_STATE: MapState = {
  isMapReady: false,
  map: undefined,
};

interface MapProviderProps {
  children: JSX.Element | JSX.Element[];
}

export const MapProvider = ({ children }: MapProviderProps) => {
  const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);

  const setMap = (mapInstance: MapboxMap) => {
    const myLocationPopup = new mapboxgl.Popup().setHTML(`
      <h4>Aquí estoy</h4>
      <p>En Algun lugar del mundo</p>
      `);

    mapInstance.on("load", () => {
      new mapboxgl.Marker({ color: "#61DAFB" })
        .setLngLat(mapInstance.getCenter())
        .setPopup(myLocationPopup) // add popup to marker
        .addTo(mapInstance);

      dispatch({ type: "setMap", payload: mapInstance });
    });
  };

  return (
    <MapContext.Provider
      value={{
        ...state,
        // methods
        setMap,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
