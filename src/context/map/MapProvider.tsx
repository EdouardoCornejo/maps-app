import mapboxgl, {
  LngLatBounds,
  Map as MapboxMap,
  Marker,
  Popup,
  type GeoJSONSourceSpecification,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "./MapContext";
import { useContext, useEffect, useReducer, type JSX } from "react";
import { mapReducer } from "./mapReducer";
import { PlacesContext } from "../places/PlacesContext";
import { directionsApi } from "../../apis";
import type { DirectionsResponse, Route } from "../../interfaces";
import {
  RouteError,
  ROUTE_DAILY_LIMIT,
  consumeRoute,
  directionsCodeMessages,
  getRemainingRoutes,
} from "../../utils";

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

// Same origin/destination (~1 m precision) reuses the route instead of spending another API call
const routeCache = new Map<string, Route>();
const MAX_CACHED_ROUTES = 50;
const routeKey = (start: [number, number], end: [number, number]) =>
  [...start, ...end].map((n) => n.toFixed(5)).join(",");

const fetchRoute = async (
  start: [number, number],
  end: [number, number]
): Promise<Route> => {
  const key = routeKey(start, end);
  const cached = routeCache.get(key);
  if (cached) return cached;

  if (getRemainingRoutes() <= 0) {
    throw new RouteError(
      `Alcanzaste el límite de ${ROUTE_DAILY_LIMIT} rutas por día. Podrás calcular nuevas rutas mañana; las que ya consultaste siguen disponibles.`
    );
  }

  consumeRoute();
  const { data } = await directionsApi.get<DirectionsResponse>(
    `/${start.join(",")};${end.join(",")}`
  );

  const [route] = data.routes ?? [];
  if (data.code !== "Ok" || !route) {
    throw new RouteError(
      directionsCodeMessages[data.code] ??
        "No se encontró una ruta hasta ese destino."
    );
  }

  if (routeCache.size >= MAX_CACHED_ROUTES) {
    routeCache.delete(routeCache.keys().next().value!);
  }
  routeCache.set(key, route);
  return route;
};

// Build popup content with DOM nodes so API text is never parsed as HTML (XSS)
const createPopupContent = (title: string, description: string) => {
  const container = document.createElement("div");
  const heading = document.createElement("h4");
  heading.textContent = title;
  const paragraph = document.createElement("p");
  paragraph.textContent = description;
  container.append(heading, paragraph);
  return container;
};

export const MapProvider = ({ children }: MapProviderProps) => {
  const [state, dispatch] = useReducer(mapReducer, INITIAL_STATE);
  const { places, isDefaultLocation } = useContext(PlacesContext);

  const setMap = (mapInstance: MapboxMap) => {
    const myLocationPopup = new mapboxgl.Popup().setDOMContent(
      createPopupContent("Aquí estoy", "En algún lugar del mundo")
    );

    mapInstance.on("load", () => {
      // Only mark "Aquí estoy" when the location really is the user's
      if (!isDefaultLocation) {
        new mapboxgl.Marker({ color: "#61DAFB" })
          .setLngLat(mapInstance.getCenter())
          .setPopup(myLocationPopup) // add popup to marker
          .addTo(mapInstance);
      }

      dispatch({ type: "setMap", payload: mapInstance });
    });
  };

  const getRouteBetweenPoints = async (
    start: [number, number],
    end: [number, number]
  ) => {
    const route = await fetchRoute(start, end);
    const { distance, duration, geometry } = route;
    const { coordinates: coords } = geometry;

    let kms = distance / 1000;
    kms = Math.round(kms * 100);
    kms /= 100;

    const minutes = Math.floor(duration / 60);
    if (import.meta.env.DEV) console.log("kms", kms, "minutes", minutes);

    const bounds = new LngLatBounds(start, start);

    for (const [coord0, coord1] of coords) {
      bounds.extend([coord0, coord1]);
    }

    state.map?.fitBounds(bounds, {
      padding: 200,
    });

    //Polyline
    const sourceData: GeoJSONSourceSpecification = {
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

    //Remove polyline if it exists
    if (state.map?.getLayer("RouteString")) {
      state.map.removeLayer("RouteString");
    }
    if (state.map?.getSource("RouteString")) {
      state.map.removeSource("RouteString");
    }

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
    if (!state.map) return;
    const newMarkers: Marker[] = [];

    for (const place of places) {
      const [lng, lat] = place.center;
      const popup = new Popup().setDOMContent(
        createPopupContent(place.text_es, place.place_name_es)
      );

      const newMarker = new Marker()
        .setPopup(popup)
        .setLngLat([lng, lat])
        .addTo(state.map);

      newMarkers.push(newMarker);
    }

    //clean polyline
    dispatch({ type: "setMarkers", payload: newMarkers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, state.map]);

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
