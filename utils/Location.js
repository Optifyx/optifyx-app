export async function getLocationForIP(ip) {
    if (!ip || !ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
        throw new Error("Please enter a valid IP address.");
    }
    try {
        const response = await fetch(`https://ipwho.is/${ip}`);
        if (!response.ok) throw new Error("Error fetching location.");
        const data = await response.json();
        if (!data.success || !data.latitude || !data.longitude) {
            throw new Error("Could not get latitude/longitude for this IP.");
        }
        return {
            ip: data.ip,
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            country: data.country,
            region: data.region,
            country_code: data.country_code,
        };
    } catch (e) {
        throw new Error("Error fetching IP data: " + e.message);
    }
}