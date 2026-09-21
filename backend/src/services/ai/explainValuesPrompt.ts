import { config } from "../../config.js";
import type { Severity } from "./severityCalculator.js";
import { aiEnabled, getClaudeClient } from "./claudeClient.js";
import { MOCK_EXPLANATIONS } from "./mockReportData.js";

export interface ValueForExplanation {
  key: string;
  name: string;
  value: string;
  unit: string;
  status: Severity;
  ref: string;
}

export interface Explanation {
  key: string;
  plain: string;
  meaning: string;
  helps: string[];
}

const EXPLAIN_TOOL = {
  name: "record_explanations",
  description: "Record a plain-English explanation for each lab value.",
  input_schema: {
    type: "object" as const,
    properties: {
      explanations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            plain: { type: "string", description: "One short sentence verdict, e.g. 'Your hemoglobin is low'." },
            meaning: { type: "string", description: "2-3 sentences explaining what this value measures and what the status means." },
            helps: {
              type: "array",
              items: { type: "string" },
              description: "1-3 concrete, actionable suggestions. For normal values, 1 short reassuring line is enough.",
            },
          },
          required: ["key", "plain", "meaning", "helps"],
        },
      },
    },
    required: ["explanations"],
  },
};

const SYSTEM_PROMPT = `You write plain-English explanations of lab test results for a patient reviewing their own report. Voice: plain clinical, second person, direct, no hedging, no reassurance theatre, always end each explanation's guidance in something the patient can actually do. Never diagnose a condition — describe what the number suggests and defer specifics to a clinician. The severity status for each value is already decided (high/low/borderline/normal) — do not contradict it or restate the raw number back as the "meaning", explain what it means for the patient.`;

export async function explainValues(values: ValueForExplanation[]): Promise<Map<string, Explanation>> {
  const result = new Map<string, Explanation>();

  if (!aiEnabled()) {
    for (const v of values) {
      const mock = MOCK_EXPLANATIONS[v.name];
      if (mock) {
        result.set(v.key, { key: v.key, ...mock });
      } else {
        result.set(v.key, genericExplanation(v));
      }
    }
    return result;
  }

  const client = getClaudeClient();
  const message = await client.messages.create({
    model: config.claudeModel,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          values.map((v) => ({ key: v.key, name: v.name, value: v.value, unit: v.unit, status: v.status, ref: v.ref }))
        ),
      },
    ],
    tools: [EXPLAIN_TOOL],
    tool_choice: { type: "tool", name: EXPLAIN_TOOL.name },
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (toolUse && toolUse.type === "tool_use") {
    const parsed = toolUse.input as { explanations: Explanation[] };
    for (const e of parsed.explanations) {
      result.set(e.key, e);
    }
  }

  for (const v of values) {
    if (!result.has(v.key)) result.set(v.key, genericExplanation(v));
  }

  return result;
}

function genericExplanation(v: ValueForExplanation): Explanation {
  const verdict =
    v.status === "normal"
      ? `Your ${v.name.toLowerCase()} is in range`
      : v.status === "borderline"
      ? `Your ${v.name.toLowerCase()} is borderline`
      : `Your ${v.name.toLowerCase()} is ${v.status}`;
  return {
    key: v.key,
    plain: verdict,
    meaning: `This measures ${v.name.toLowerCase()}. Reference range: ${v.ref}.`,
    helps:
      v.status === "normal"
        ? ["No action needed here"]
        : ["Discuss this result with your doctor at your next visit"],
  };
}
