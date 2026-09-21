import { config } from "../../config.js";

export interface GeoPoint {
  lat: number;
  lon: number;
  city?: string;
}

function isPrivateOrLoopback(ip: string): boolean {
  return ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("::ffff:127.");
}

function parseFallback(): GeoPoint {
  const [lat, lon] = config.devFallbackLocation.split(",").map(Number);
  return { lat, lon };
}

// IP-based geolocation, per the PRD's literal wording (not browser
// geolocation). ip-api.com needs no API key. DEV_FALLBACK_LOCATION covers
// localhost, where a real IP lookup is meaningless.
export async function geolocateIp(ip: string): Promise<GeoPoint> {
  if (isPrivateOrLoopback(ip)) {
    return parseFallback();
  }

  if (config.ipGeoProvider === "ip-api") {
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,lat,lon,city`);
      const data = (await res.json()) as { status: string; lat: number; lon: number; city: string };
      if (data.status === "success") {
        return { lat: data.lat, lon: data.lon, city: data.city };
      }
    } catch {
      // fall through to fallback location below
    }
  }

  return parseFallback();
}
