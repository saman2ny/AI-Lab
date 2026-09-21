import { OAuth2Client } from "google-auth-library";
import { config } from "../../config.js";

const client = config.googleOAuthClientId ? new OAuth2Client(config.googleOAuthClientId) : null;

export interface GoogleProfile {
  sub: string;
  email: string;
}

export function isGoogleAuthConfigured(): boolean {
  return client !== null;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (!client) {
    throw new Error("Google sign-in isn't configured on this server yet.");
  }
  const ticket = await client.verifyIdToken({ idToken, audience: config.googleOAuthClientId });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.sub) {
    throw new Error("Google didn't return a verified email.");
  }
  return { sub: payload.sub, email: payload.email };
}
