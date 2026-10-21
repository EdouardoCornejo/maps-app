import { isAxiosError } from 'axios';

// Mapbox tokens: pk = public (meant for the browser), sk = secret, tk = temporary
const PUBLIC_TOKEN_REGEX = /^pk\.[\w-]+\.[\w-]+$/;
const ANY_TOKEN_REGEX = /\b(pk|sk|tk)\.[\w-]+\.[\w-]+/g;
const ACCESS_TOKEN_PARAM_REGEX = /(access_token=)[^&\s"']+/g;

/**
 * Single entry point to read the Mapbox token. Only public (pk.) tokens are
 * accepted: anything shipped to the browser is readable by users, so a secret
 * token here would be a leak.
 */
export const getMapboxToken = (): string => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN?.trim();

    if (!token) {
        throw new Error('Falta VITE_MAPBOX_TOKEN: copia .env.template a .env y completa los valores.');
    }
    if (!token.startsWith('pk.')) {
        throw new Error('VITE_MAPBOX_TOKEN debe ser un token público (pk.). Nunca uses un token secreto (sk.) en el frontend.');
    }
    if (!PUBLIC_TOKEN_REGEX.test(token)) {
        throw new Error('VITE_MAPBOX_TOKEN no tiene un formato válido.');
    }

    return token;
};

/** Removes any Mapbox token from a string so it never ends up in logs */
export const redactToken = (text: string): string =>
    text
        .replace(ACCESS_TOKEN_PARAM_REGEX, '$1[REDACTED]')
        .replace(ANY_TOKEN_REGEX, '$1.[REDACTED]');

/**
 * Safe-to-log version of an error. Axios errors carry the request config
 * (with access_token), so only status and a redacted message are kept.
 */
export const toSafeError = (error: unknown): string => {
    if (isAxiosError(error)) {
        const status = error.response?.status ?? 'sin respuesta';
        return redactToken(`${error.message} (status: ${status})`);
    }
    if (error instanceof Error) return redactToken(error.message);
    return redactToken(String(error));
};
