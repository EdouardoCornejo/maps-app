import mapboxgl, {
  LngLatBounds,
  Map as MapboxMap,
  Marker,
  Popup,
  type AnySourceData,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "./MapContext";
import { useContext, useEffect, useReducer, type JSX } from "react";
import { mapReducer } from "./mapReducer";
import { PlacesContext } from "../places/PlacesContext";
import { directionsApi } from "../../apis/directionsApi";
import type { DirectionsResponse } from "../../interfaces";

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

  const getRouteBetweenPoints = async (
    start: [number, number],
    end: [number, number]
  ) => {
    const { data } = await directionsApi.get<DirectionsResponse>(
      `/${start.join(",")};${end.join(",")}`
    );
    const { distance, duration, geometry } = data.routes[0];
    const { coordinates: coords } = geometry;

    let kms = distance / 1000;
    kms = Math.round(kms * 100);
    kms /= 100;

    const minutes = Math.floor(duration / 60);
    console.log("kms", kms, "minutes", minutes);

    const bounds = new LngLatBounds(start, start);

    for (const [coord0, coord1] of coords) {
      bounds.extend([coord0, coord1]);
    }

    state.map?.fitBounds(bounds, {
      padding: 200,
    });

    //Polyline
    const sourceData: AnySourceData = {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coords,
            },
          },
        ],
      },
    };

    if (state.map?.getLayer("RouteString")) {
      state.map.removeLayer("RouteString");
      state.map.removeSource("RouteString");
    }

    //Remove polyline if it exists
    state.map?.addSource("RouteString", sourceData);

    state.map?.addLayer({
      id: "RouteString",
      type: "line",
      source: "RouteString",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#61DAFB",
        "line-width": 3,
        "line-opacity": 0.75,
      },
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
        getRouteBetweenPoints,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
