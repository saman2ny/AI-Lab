import { config } from "../../config.js";
import { geolocateIp } from "./ipGeoService.js";

interface PlaceResult {
  name: string;
  address: string;
}

async function findNearbyDoctors(lat: number, lon: number): Promise<PlaceResult[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lon}`);
  url.searchParams.set("radius", "5000");
  url.searchParams.set("type", "doctor");
  url.searchParams.set("key", config.googlePlacesApiKey!);

  const res = await fetch(url);
  const data = (await res.json()) as { results: { name: string; vicinity: string }[] };
  return (data.results ?? []).slice(0, 5).map((r) => ({ name: r.name, address: r.vicinity }));
}

// Chat-facing entry point: geolocates the request IP, then looks up nearby
// doctors. Degrades gracefully to a clear "can't do this right now" message
// if the Places API key isn't configured, rather than erroring the chat.
export async function lookupDoctors(clientIp: string): Promise<string> {
  if (!config.googlePlacesApiKey) {
    return "I can't reach the doctor-lookup service right now (it needs a Places API key that isn't configured), so I can't pull real nearby results. Once it's connected I'll use your approximate location to suggest clinics near you.";
  }

  try {
    const geo = await geolocateIp(clientIp);
    const results = await findNearbyDoctors(geo.lat, geo.lon);
    if (results.length === 0) {
      return `I couldn't find any doctors listed near ${geo.city ?? "your area"}. Try a general search for clinics nearby, or ask your regular pharmacy for a referral.`;
    }
    const list = results.map((r) => `• ${r.name} — ${r.address}`).join("\n");
    return `Here are a few options near ${geo.city ?? "you"}:\n${list}\n\nThis is a general listing, not a personal recommendation — check that they're accepting new patients.`;
  } catch {
    return "I ran into a problem looking that up just now — try again in a moment.";
  }
}
