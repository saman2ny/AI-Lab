import nodemailer from "nodemailer";
import { config } from "../../config.js";

const transport = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    })
  : null;

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  if (!transport) {
    if (config.nodeEnv === "production") {
      throw new Error("Email delivery is not configured on the server.");
    }
    console.log(`[dev email] verification code for ${to}: ${code}`);
    return;
  }

  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject: "Your Lab Explainer verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}