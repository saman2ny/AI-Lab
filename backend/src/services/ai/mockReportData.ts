// Backend-side mirror of the frontend's illustrative sample dataset, in raw
// "just extracted" shape (before severity classification or explanation
// generation). Used when MOCK_AI=true, so the whole pipeline — severity
// calculator, walkthrough ordering, explanations — runs on real logic
// against consistent sample data instead of returning a canned final
// answer.
export interface RawExtractedValue {
  name: string;
  rawValue: string;
  unit: string;
  refRangeRaw: string;
  category: string;
}

export const MOCK_REPORT_LABEL = "Blood panel";
export const MOCK_REPORT_DATE = "12 Sep 2026";

export const MOCK_RAW_VALUES: RawExtractedValue[] = [
  { name: "Hemoglobin", rawValue: "10.2", unit: "g/dL", refRangeRaw: "12.0 - 15.5", category: "RBC Parameters" },
  { name: "LDL Cholesterol", rawValue: "168", unit: "mg/dL", refRangeRaw: "Below 100", category: "Lipid Panel" },
  { name: "HbA1c", rawValue: "5.9", unit: "%", refRangeRaw: "Below 5.7", category: "Metabolic Panel" },
  { name: "Vitamin D", rawValue: "28", unit: "ng/mL", refRangeRaw: "30 - 100", category: "Vitamins" },
  { name: "Fasting Glucose", rawValue: "92", unit: "mg/dL", refRangeRaw: "70 - 99", category: "Metabolic Panel" },
  { name: "TSH", rawValue: "4.3", unit: "mIU/L", refRangeRaw: "0.4 - 4.0", category: "Endocrine Panel" },
  { name: "Creatinine", rawValue: "0.9", unit: "mg/dL", refRangeRaw: "0.6 - 1.3", category: "Kidney Panel" },
  { name: "White Blood Cell Count", rawValue: "6.8", unit: "x10³/µL", refRangeRaw: "4.0 - 11.0", category: "Haematology" },
  { name: "Platelets", rawValue: "265", unit: "x10³/µL", refRangeRaw: "150 - 400", category: "Haematology" },
  { name: "ALT", rawValue: "28", unit: "U/L", refRangeRaw: "7 - 56", category: "Liver Panel" },
  { name: "HDL Cholesterol", rawValue: "52", unit: "mg/dL", refRangeRaw: "Above 40", category: "Lipid Panel" },
];

export interface MockExplanation {
  plain: string;
  meaning: string;
  helps: string[];
}

// Keyed by the same `name` as MOCK_RAW_VALUES, so the mock explanation step
// can look up matching copy instead of generating generic filler text.
export const MOCK_EXPLANATIONS: Record<string, MockExplanation> = {
  Hemoglobin: {
    plain: "Your hemoglobin is low",
    meaning:
      "Hemoglobin carries oxygen from your lungs to the rest of your body. Yours is below the typical range, which can leave you feeling tired or short of breath and usually points to iron levels worth checking.",
    helps: [
      "Add iron-rich foods — red meat, spinach, lentils — alongside vitamin C to help absorption",
      "Ask your doctor about an iron panel to find the cause before starting supplements",
      "Flag any heavy periods, fatigue or dizziness at your next visit",
    ],
  },
  "LDL Cholesterol": {
    plain: "Your LDL cholesterol is high",
    meaning:
      "LDL is the cholesterol that can build up in your artery walls over time. Yours is well above the target, which raises long-term risk for heart disease if it stays there.",
    helps: [
      "Cut back on saturated fat — fried food, fatty cuts of meat, full-fat dairy",
      "Add soluble fibre — oats, beans, apples — which helps lower LDL directly",
      "Get moving most days; even brisk walking measurably improves LDL over months",
    ],
  },
  HbA1c: {
    plain: "Your HbA1c is borderline",
    meaning:
      "HbA1c reflects your average blood sugar over the last 2–3 months. Yours sits just above the normal range, in the range doctors call prediabetes — it's a signal to act now, not a diagnosis.",
    helps: [
      "Cut back on refined carbs and sugary drinks — they move this number the most",
      "Add a 10–15 minute walk after meals to blunt blood sugar spikes",
      "Recheck in 3–6 months to see the trend, not just one number",
    ],
  },
  "Vitamin D": {
    plain: "Your vitamin D is borderline low",
    meaning:
      "Vitamin D supports bone health, muscle function and immune response. Yours is just under the normal range — common if you get limited sun exposure — and is easy to correct.",
    helps: [
      "Get 10–15 minutes of midday sun on your arms/face a few times a week if you can",
      "Add vitamin D sources — fatty fish, egg yolks, fortified milk",
      "Ask your doctor whether a daily supplement makes sense for you",
    ],
  },
  "Fasting Glucose": {
    plain: "Your fasting glucose is in range",
    meaning:
      "This measures blood sugar after a period without eating. Yours is comfortably within the normal range, with no signs of insulin resistance.",
    helps: ["Keep the habits that got you here — regular meals, regular activity", "Worth rechecking yearly, especially alongside HbA1c"],
  },
  TSH: {
    plain: "Your TSH is borderline high",
    meaning:
      "TSH signals your thyroid to produce hormone — a slightly high reading can mean your thyroid is working a little harder than usual to keep hormone levels normal.",
    helps: [
      "Mention any fatigue, weight change or cold sensitivity to your doctor",
      "A repeat test in a few months is the usual next step, not immediate treatment",
    ],
  },
  Creatinine: {
    plain: "Your creatinine is in range",
    meaning: "Creatinine is a waste product filtered by your kidneys. Yours is normal, suggesting your kidneys are clearing it efficiently.",
    helps: ["Stay well hydrated day to day", "No action needed — keep this as a baseline for future checkups"],
  },
  "White Blood Cell Count": {
    plain: "Your white cell count is in range",
    meaning: "White blood cells fight infection. Your count is normal, with no sign of active infection or immune stress.",
    helps: ["No action needed here"],
  },
  Platelets: {
    plain: "Your platelets are in range",
    meaning: "Platelets help your blood clot. Yours are within the normal range, so clotting function looks typical.",
    helps: ["No action needed here"],
  },
  ALT: {
    plain: "Your ALT is in range",
    meaning: "ALT is a liver enzyme. Yours is normal, with no sign of liver stress or inflammation.",
    helps: ["No action needed here"],
  },
  "HDL Cholesterol": {
    plain: "Your HDL cholesterol is in range",
    meaning: "HDL is the “good” cholesterol that helps clear LDL from your arteries. Yours is healthy and working in your favour.",
    helps: ["Keep up regular activity — it's one of the best ways to raise HDL further"],
  },
};
