
import axios from 'axios';

export const searchApi = axios.create({
    baseURL: import.meta.env.VITE_SEARCH_API,
    params: {
        limit: 5,
        language: 'es',
        access_token: import.meta.env.VITE_MAPBOX_TOKEN,
    }
})