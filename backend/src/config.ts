import "dotenv/config";

function bool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  return v === "true" || v === "1";
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV ?? "development",
  idleTimeoutMs: Number(process.env.IDLE_TIMEOUT_MS ?? 15 * 60 * 1000),

  jwtSecret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? "dev-refresh-secret-change-me",
  dataEncKey: process.env.DATA_ENC_KEY ?? "dev-data-enc-key-32-bytes-change",

  anthropicApiKey: process.env.ANTHROPIC_API_KEY || undefined,
  mockAi: bool(process.env.MOCK_AI, true),
  claudeModel: process.env.CLAUDE_MODEL ?? "claude-sonnet-5",

  googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || undefined,

  smtp: {
    host: process.env.SMTP_HOST || undefined,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
    from: process.env.SMTP_FROM ?? "Lab Explainer <no-reply@example.com>",
  },
  devExposeOtp: bool(process.env.DEV_EXPOSE_OTP, true),

  ipGeoProvider: process.env.IPGEO_PROVIDER ?? "ip-api",
  devFallbackLocation: process.env.DEV_FALLBACK_LOCATION ?? "12.9716,77.5946",
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || undefined,

  ocrProvider: process.env.OCR_PROVIDER ?? "tesseract",
};
