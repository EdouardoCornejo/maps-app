
import axios from 'axios';
import { mapboxEndpoints } from '../constant';


const Geometries = {
    Polyline: 'polyline',
    Geojson: 'geojson',
    Polyline6: 'polyline6',
} as const;

const Overview = {
    Simplified: 'simplified',
    Full: 'full',
}


export const directionsApi = axios.create({
    baseURL: import.meta.env.VITE_MAPBOX_API + mapboxEndpoints.directions,
    params: {
        alternatives: false,
        geometries: Geometries.Geojson,
        overview: Overview.Simplified,
        steps: false,
        access_token: import.meta.env.VITE_MAPBOX_TOKEN,
    }
})