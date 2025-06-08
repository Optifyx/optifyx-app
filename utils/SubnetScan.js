import * as Network from 'expo-network';

export function isExpoWebLocalhost() {
    if (typeof window !== "undefined" && window.location) {
        const { hostname } = window.location;
        return (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "::1"
        );
    }
    return false;
}

function getSubnet(ip) {
    if (!ip) return null;
    return ip.split('.').slice(0, 3).join('.');
}

export async function scanSubnet(onFound, onProgress) {
    let found = null;
    let testedIPs = [];
    let stop = false;
    try {
        if (isExpoWebLocalhost()) {
            onProgress(["127.0.0.1"]);
            onFound("127.0.0.1", ["127.0.0.1"]);
            return;
        }
        const ip = await Network.getIpAddressAsync();
        const subnet = getSubnet(ip);
        if (!subnet) throw new Error('Could not identify subnet.');
        for (let i = 1; i <= 254 && !stop; i++) {
            const testIp = subnet + '.' + i;
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 900);
                const response = await fetch('http://' + testIp + ':3000/check_online_connections', { method: 'GET', signal: controller.signal });
                clearTimeout(timeout);
                testedIPs.push(testIp);
                onProgress([...testedIPs]);
                if (response.ok && !found) {
                    found = testIp;
                    stop = true;
                    break;
                }
            } catch (e) {
                testedIPs.push(testIp);
                onProgress([...testedIPs]);
            }
            await new Promise(res => setTimeout(res, 40));
        }
        onFound(found, testedIPs);
    } catch (e) {
        onFound(null, testedIPs);
    }
}