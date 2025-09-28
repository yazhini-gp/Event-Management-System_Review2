const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const hasSmtpCreds = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (hasSmtpCreds) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true" || port === 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: String(process.env.SMTP_DEBUG || "0") === "1",
      debug: String(process.env.SMTP_DEBUG || "0") === "1",
    });
  } else {
    // Dev fallback: output emails to console instead of sending
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@example.com";
  const info = await t.sendMail({ from, to, subject, html });
  if (info && info.message) {
    // streamTransport: print to console for visibility in dev
    try { console.log("[DEV EMAIL OUTPUT]", info.message.toString()); } catch (_) {}
  }
  return info;
}

module.exports = { sendEmail };



