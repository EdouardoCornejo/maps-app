
import axios from 'axios';
import { mapboxEndpoints } from '../constant';
import { getMapboxToken } from '../utils';

export const searchApi = axios.create({
    baseURL: import.meta.env.VITE_MAPBOX_API + mapboxEndpoints.search,
    params: {
        limit: 5,
        language: 'es',
        access_token: getMapboxToken(),
    }
})