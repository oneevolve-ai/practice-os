import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("[Email] SMTP not configured, skipping:", subject);
      return;
    }

    await transporter.sendMail({
      from: process.env.NOTIFICATION_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("[Email] Sent:", subject, "to", to);
  } catch (error) {
    console.error("[Email] Failed to send:", error);
  }
}
