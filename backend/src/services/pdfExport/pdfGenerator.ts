import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import type { SessionReport } from "../sessionStore/inMemoryStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

Handlebars.registerHelper("statusLabel", (status: string) => {
  switch (status) {
    case "high":
      return "Above range";
    case "low":
      return "Below range";
    case "borderline":
      return "Borderline";
    default:
      return "In range";
  }
});

let compiledTemplate: Handlebars.TemplateDelegate | null = null;

async function getTemplate() {
  if (!compiledTemplate) {
    const source = await readFile(path.join(__dirname, "templates", "report.html"), "utf-8");
    compiledTemplate = Handlebars.compile(source);
  }
  return compiledTemplate;
}

export async function generateReportPdf(report: SessionReport): Promise<Buffer> {
  const template = await getTemplate();
  const html = template(report);

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "a4", printBackground: true, margin: { top: "20px", bottom: "20px" } });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
