import nodemailer from "nodemailer";
import { config } from "../../config.js";

const transport = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    })
  : null;

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  if (transport) {
    await transport.sendMail({
      from: config.smtp.from,
      to,
      subject: "Your Lab Explainer verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
    });
    return;
  }
  // Dev fallback: no SMTP configured, so the code just goes to the server
  // console. DEV_EXPOSE_OTP additionally echoes it in the API response
  // (see auth.routes.ts) so the whole flow is demoable without real SMTP.
  console.log(`[dev email] verification code for ${to}: ${code}`);
}
