import Anthropic from "@anthropic-ai/sdk";
import { config } from "../../config.js";
let client = null;
export function getClaudeClient() {
    if (!config.anthropicApiKey) {
        throw new Error("ANTHROPIC_API_KEY is not set.");
    }
    if (!client) {
        client = new Anthropic({ apiKey: config.anthropicApiKey });
    }
    return client;
}
export function aiEnabled() {
    return !config.mockAi && !!config.anthropicApiKey;
}
