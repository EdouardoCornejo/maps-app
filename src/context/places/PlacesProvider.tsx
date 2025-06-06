import { useEffect, useReducer, type JSX } from "react";
import { PlacesContext } from "./PlacesContext";
import { placesReducer } from "./placesReducer";
import { getUserLocation } from "../../helpers";
import { searchApi } from "../../apis";
import type { Feature, PlacesResponse } from "../../interfaces";

export interface PlacesState {
  isLoading: boolean;
  userLocation?: [number, number];
  isLoadingPlaces: boolean;
  places: Array<Feature>;
}

const INITIAL_STATE: PlacesState = {
  isLoading: true,
  userLocation: undefined,
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
    if (!state.userLocation) throw new Error("No hay ubicacion del usuario");

    dispatch({
      type: "setloadingPlaces",
    });

    const response = await searchApi.get<PlacesResponse>(`/${query}.json`, {
      params: {
        proximity: state.userLocation.join(","),
      },
    });

    dispatch({
      type: "setPlaces",
      payload: response.data.features,
    });

    return response.data.features;
  };

  useEffect(() => {
    getUserLocation().then((lngLat) =>
      dispatch({ type: "setUserLocation", payload: lngLat })
    );
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
