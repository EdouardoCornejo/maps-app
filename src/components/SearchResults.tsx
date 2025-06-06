import { useContext, useState } from "react";
import { MapContext, PlacesContext } from "../context";
import type { Feature } from "../interfaces";
import { LoadingPlaces } from "./LoadingPlaces";

export const SearchResults = () => {
  const { places, isLoadingPlaces } = useContext(PlacesContext);
  const { map } = useContext(MapContext);
  const [activeId, setActiveId] = useState<string>("");

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

  return (
    <ul className={`list-group  ${places.length && "mt-3"}`}>
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
          >
            Direcciones
          </button>
        </li>
      ))}
    </ul>
  );
};
