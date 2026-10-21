
// The geolocation timeout only starts once permission is granted, so an ignored prompt would wait forever
const MAX_WAIT_MS = 15000;

export const getUserLocation = async (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocalización no soportada por este navegador"))
            return
        }

        const timer = setTimeout(
            () => reject(new Error("Tiempo de espera de geolocalización agotado")),
            MAX_WAIT_MS,
        )

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                clearTimeout(timer)
                resolve([coords.longitude, coords.latitude])
            },
            (error) => {
                clearTimeout(timer)
                reject(error)
            },
            { timeout: 10000 },
        )
    })
}
