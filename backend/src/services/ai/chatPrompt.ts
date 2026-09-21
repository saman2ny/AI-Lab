import { config } from "../../config.js";
import type { SessionReport } from "../sessionStore/inMemoryStore.js";
import { aiEnabled, getClaudeClient } from "./claudeClient.js";
import { lookupDoctors } from "../doctor/placesService.js";

export interface ChatTurn {
  role: "user" | "bot";
  text: string;
}

const SYSTEM_PROMPT_TEMPLATE = (report: SessionReport) => `You are a plain-language assistant helping a patient understand their own lab report. Answer strictly from the report data below — never invent values, never diagnose a condition, and defer specifics to a clinician. If asked something unrelated to the report, say you can only speak to what's in the uploaded report. Keep replies short (2-4 sentences) and in plain, second-person language.

Report date: ${report.meta.date}
Values:
${report.values.map((v) => `- ${v.name}: ${v.value} ${v.unit} (${v.status}, ref ${v.ref}) — ${v.plain}`).join("\n")}

If the user asks to find a doctor near them, say you'll look that up rather than answering from the report.`;

const FIND_DOCTOR_TOOL = {
  name: "find_nearby_doctors",
  description: "Look up doctors or clinics near the patient's approximate location.",
  input_schema: { type: "object" as const, properties: {}, required: [] },
};

function isDoctorRequest(message: string): boolean {
  return /doctor|clinic|physician/i.test(message);
}

export async function chatReply(report: SessionReport, history: ChatTurn[], message: string, clientIp: string): Promise<string> {
  if (isDoctorRequest(message)) {
    return lookupDoctors(clientIp);
  }

  if (!aiEnabled()) {
    return mockReply(message);
  }

  const client = getClaudeClient();
  const response = await client.messages.create({
    model: config.claudeModel,
    max_tokens: 512,
    system: SYSTEM_PROMPT_TEMPLATE(report),
    messages: [
      ...history.map((h) => ({ role: h.role === "bot" ? ("assistant" as const) : ("user" as const), content: h.text })),
      { role: "user" as const, content: message },
    ],
    tools: [FIND_DOCTOR_TOOL],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (toolUse && toolUse.type === "tool_use" && toolUse.name === "find_nearby_doctors") {
    return lookupDoctors(clientIp);
  }

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "I couldn't come up with a reply — try asking again.";
}

function mockReply(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("eat") || m.includes("food")) {
    return "Based on your panel, focus on iron-rich foods for your hemoglobin and less saturated fat for your LDL — see the \"What helps\" list on each flagged value for specifics.";
  }
  if (m.includes("tired") || m.includes("fatigue")) {
    return "Your hemoglobin is a bit low, which is a common cause of feeling tired — it's worth mentioning to your doctor alongside how you've been sleeping.";
  }
  if (m.includes("diabet")) {
    return "I can't diagnose anything — but your HbA1c is borderline, which is worth discussing with your doctor. It's not a diagnosis on its own.";
  }
  return "I can only speak to what's in your uploaded report. Could you ask about a specific value, like your LDL or HbA1c?";
}
