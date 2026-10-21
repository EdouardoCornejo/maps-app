// Per-browser daily cap on Directions API calls, to protect the free tier from
// accidental overuse. It lives in localStorage, so it is a courtesy limit, not
// a security boundary: the real protection is the URL-restricted token.
export const ROUTE_DAILY_LIMIT = 10;

const STORAGE_KEY = 'maps-app:route-quota';

interface RouteQuota {
    date: string;
    count: number;
}

// Fallback when storage is blocked (private mode, disabled cookies)
let memoryQuota: RouteQuota | null = null;

const today = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD, local time

const readQuota = (): RouteQuota => {
    let quota = memoryQuota;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) quota = JSON.parse(raw) as RouteQuota;
    } catch {
        // ignore: use the in-memory value
    }

    if (!quota || quota.date !== today() || typeof quota.count !== 'number') {
        return { date: today(), count: 0 };
    }
    return quota;
};

const writeQuota = (quota: RouteQuota) => {
    memoryQuota = quota;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quota));
    } catch {
        // ignore: the in-memory value still applies for this session
    }
};

export const getRemainingRoutes = (): number =>
    Math.max(0, ROUTE_DAILY_LIMIT - readQuota().count);

export const consumeRoute = () => {
    const quota = readQuota();
    writeQuota({ ...quota, count: quota.count + 1 });
};
