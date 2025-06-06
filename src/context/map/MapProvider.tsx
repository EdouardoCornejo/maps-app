import mapboxgl, { Map as MapboxMap, Marker, Popup } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "./MapContext";
import { useContext, useEffect, useReducer, type JSX } from "react";
import { mapReducer } from "./mapReducer";
import { PlacesContext } from "../places/PlacesContext";

export interface MapState {
  isMapReady: boolean;
  map?: MapboxMap;
  markers: Marker[];
}

const INITIAL_STATE: MapState = {
  isMapReady: false,
  map: undefined,
  markers: [],
};

interface MapProviderProps {
  children: JSX.Element | JSX.Element[];
}

export const MapProvider = ({ children }: MapProviderProps) => {
  const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);
  const { places } = useContext(PlacesContext);

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

  useEffect(() => {
    state.markers.forEach((marker) => marker.remove());
    const newMarkers: Marker[] = [];

    for (const place of places) {
      const [lng, lat] = place.center;
      const popup = new Popup().setHTML(`
            <h4>${place.text_es}</h4>
            <p>${place.place_name_es}</p>`);

      const newMarker = new Marker()
        .setPopup(popup)
        .setLngLat([lng, lat])
        .addTo(state.map!);

      newMarkers.push(newMarker);
    }

    //clean polyline
    dispatch({ type: "setMarkers", payload: newMarkers });
  }, [places]);

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
