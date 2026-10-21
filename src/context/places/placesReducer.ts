import type { Feature } from "../../interfaces";
import type { PlacesState } from "./PlacesProvider";

type PlacesAction = {
    type: 'setUserLocation',
    payload: [number, number]
}
    | {
        type: 'setDefaultLocation',
        payload: [number, number]
    }
    | {
        type: 'setPlaces',
        payload: Array<Feature>
    } | {
        type: 'setloadingPlaces',
    }



export const placesReducer = (state: PlacesState, action: PlacesAction): PlacesState => {

    switch (action.type) {
        case 'setUserLocation':
            return {
                ...state,
                isLoading: false,
                userLocation: action.payload,
                isDefaultLocation: false
            }
        case 'setDefaultLocation':
            return {
                ...state,
                isLoading: false,
                userLocation: action.payload,
                isDefaultLocation: true
            }
        case 'setloadingPlaces':
            return {
                ...state,
                isLoadingPlaces: true,
                places: []
            }
        case 'setPlaces':
            return {
                ...state,
                isLoadingPlaces: false,
                places: action.payload
            }
        default:
            return state;
    }
} 