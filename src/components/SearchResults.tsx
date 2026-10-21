import { useCallback, useContext, useState } from "react";
import { MapContext, PlacesContext } from "../context";
import type { Feature } from "../interfaces";
import { LoadingPlaces } from "./LoadingPlaces";
import { ErrorModal } from "./ErrorModal";
import { getRouteErrorMessage, toSafeError } from "../utils";

export const SearchResults = () => {
  const { places, isLoadingPlaces, userLocation } = useContext(PlacesContext);
  const { map, getRouteBetweenPoints } = useContext(MapContext);
  const [activeId, setActiveId] = useState<string>("");
  const [routeError, setRouteError] = useState<string | null>(null);
  const closeRouteError = useCallback(() => setRouteError(null), []);

  const onPlaceClick = (place: Feature) => {
    const [lng, lat] = place.center;
    setActiveId(place.id);
    map?.flyTo({
      zoom: 14,
      center: [lng, lat],
    });
  };

  if (isLoadingPlaces) {
    return <LoadingPlaces />;
  }

  const getRoute = (place: Feature) => {
    if (!userLocation) return;

    const [lng, lat] = place.center;
    getRouteBetweenPoints(userLocation, [lng, lat]).catch((error) => {
      console.error("No se pudo obtener la ruta:", toSafeError(error));
      setRouteError(getRouteErrorMessage(error));
    });
  };

  return (
    <>
      {routeError && (
        <ErrorModal
          title="No se pudo calcular la ruta"
          message={routeError}
          onClose={closeRouteError}
        />
      )}
      <ul className={`list-group ${places.length > 0 ? "mt-3" : ""}`}>
        {places.map((place: Feature) => (
          <li
            key={place.id}
            className={`list-group-item list-group-item-action pointer ${
              activeId === place.id ? "active" : ""
            }`}
            onClick={() => onPlaceClick(place)}
          >
            <h6>{place.text_es}</h6>
            <p
              style={{
                fontSize: "12px",
              }}
            >
              {place.place_name}
            </p>

            <button
              className={`btn btn-outline-primary btn-sm ${
                activeId === place.id
                  ? "btn-outline-light"
                  : "btn-outline-primary"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                getRoute(place);
              }}
            >
              Direcciones
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};
