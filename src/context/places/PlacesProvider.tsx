import { useEffect, useReducer, type JSX } from "react";
import { PlacesContext } from "./PlacesContext";
import { placesReducer } from "./placesReducer";
import { getUserLocation } from "../../helpers";
import { searchApi } from "../../apis";
import { DEFAULT_LOCATION } from "../../constant";
import { toSafeError } from "../../utils";
import type { Feature, PlacesResponse } from "../../interfaces";

export interface PlacesState {
  isLoading: boolean;
  userLocation?: [number, number];
  isDefaultLocation: boolean;
  isLoadingPlaces: boolean;
  places: Array<Feature>;
}

const INITIAL_STATE: PlacesState = {
  isLoading: true,
  userLocation: undefined,
  isDefaultLocation: false,
  isLoadingPlaces: false,
  places: [],
};

interface PlacesProviderProps {
  children: JSX.Element | JSX.Element[];
}

export const PlacesProvider = ({ children }: PlacesProviderProps) => {
  const [state, dispatch] = useReducer(placesReducer, INITIAL_STATE);

  const searchPlacesByTerm = async (query: string): Promise<Array<Feature>> => {
    if (query.length === 0) {
      dispatch({
        type: "setPlaces",
        payload: [],
      });

      return [];
    }
    if (!state.userLocation) return [];

    dispatch({
      type: "setloadingPlaces",
    });

    try {
      const response = await searchApi.get<PlacesResponse>(
        `/${encodeURIComponent(query)}.json`,
        {
          params: {
            proximity: state.userLocation.join(","),
          },
        }
      );

      dispatch({
        type: "setPlaces",
        payload: response.data.features,
      });

      return response.data.features;
    } catch (error) {
      console.error("No se pudieron buscar lugares:", toSafeError(error));
      dispatch({ type: "setPlaces", payload: [] });
      return [];
    }
  };

  useEffect(() => {
    getUserLocation()
      .then((lngLat) => dispatch({ type: "setUserLocation", payload: lngLat }))
      .catch((error) => {
        console.warn("Sin geolocalización, usando ubicación por defecto:", error);
        dispatch({ type: "setDefaultLocation", payload: DEFAULT_LOCATION });
      });
  }, []);

  return (
    <PlacesContext.Provider
      value={{
        ...state,
        // Methods
        searchPlacesByTerm,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};
