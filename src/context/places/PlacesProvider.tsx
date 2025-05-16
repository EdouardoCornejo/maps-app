import type { JSX } from "react";
import { PlacesContext } from "./PlacesContext";

export interface PlacesState {
  isLoading: boolean;
  userLocation?: [number, number];
}

const INITIAL_STATE: PlacesState = {
  isLoading: true,
  userLocation: undefined,
};

interface PlacesProviderProps {
  children: JSX.Element | JSX.Element[];
}

export const PlacesProvider = ({ children }: PlacesProviderProps) => {
  return (
    <PlacesContext.Provider
      value={INITIAL_STATE}
    >
      {children}
    </PlacesContext.Provider>
  );
};
