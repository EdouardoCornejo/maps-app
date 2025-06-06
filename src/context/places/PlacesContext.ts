import { createContext } from "react";
import type { Feature } from "../../interfaces";


export interface PlacesContextProps {
    isLoading: boolean;
    userLocation?: [number, number]; 
    isLoadingPlaces: boolean;
    places: Array<Feature>;
    searchPlacesByTerm: (query: string) => Promise<Array<Feature>>;
}

export const PlacesContext = createContext<PlacesContextProps>({} as PlacesContextProps);