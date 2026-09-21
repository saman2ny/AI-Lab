import Anthropic from "@anthropic-ai/sdk";
import { config } from "../../config.js";

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  if (!client) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

export function aiEnabled(): boolean {
  return !config.mockAi && !!config.anthropicApiKey;
}
