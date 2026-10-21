import { isAxiosError } from 'axios';

/** Error whose message is already safe and meant to be shown to the user */
export class RouteError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RouteError';
    }
}

// Directions API returns NoRoute / NoSegment with HTTP 200, so they come in the body `code`
// https://docs.mapbox.com/api/navigation/directions/#directions-api-errors
export const directionsCodeMessages: Record<string, string> = {
    NoRoute: 'No existe una ruta en auto hasta ese destino (por ejemplo, está al otro lado del mar).',
    NoSegment: 'El destino está demasiado lejos de una calle o camino para poder llegar en auto.',
};

export const getRouteErrorMessage = (error: unknown): string => {
    if (error instanceof RouteError) return error.message;

    if (isAxiosError(error)) {
        const status = error.response?.status;

        if (!status) return 'No hay conexión con el servicio de mapas. Revisa tu internet e intenta de nuevo.';
        if (status === 401 || status === 403) return 'El servicio de mapas rechazó la solicitud. Revisa la configuración del token de Mapbox.';
        if (status === 422) return 'No se puede calcular una ruta en auto hasta ese destino: está demasiado lejos (máximo 10,000 km) o no es un punto válido.';
        if (status === 429) return 'Se hicieron demasiadas solicitudes seguidas. Espera un minuto e intenta de nuevo.';
        if (status >= 500) return 'El servicio de rutas no está disponible en este momento. Intenta más tarde.';
    }

    return 'No se pudo calcular la ruta. Intenta de nuevo.';
};
