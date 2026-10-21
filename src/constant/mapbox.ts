export const mapboxEndpoints = {
    directions: 'directions/v5/mapbox/driving',
    search: 'geocoding/v5/mapbox.places/'
}

export const mapboxStyle = 'mapbox://styles/mapbox/dark-v11';

// [lng, lat] used when the browser can't or won't share the user's location (Ciudad de México)
export const DEFAULT_LOCATION: [number, number] = [-99.1332, 19.4326];
