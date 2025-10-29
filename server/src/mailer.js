import nodemailer from 'nodemailer';
import fs from 'node:fs';

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env;

let transporter = null;
if (MAIL_HOST && MAIL_PORT && MAIL_USER && MAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure: false,
    auth: { user: MAIL_USER, pass: MAIL_PASS }
  });
}

// Rate limiting: delay entre correos para evitar "Too many emails per second"
const EMAIL_DELAY_MS = 1500; // 1.5 segundos entre correos
let lastEmailTime = 0;

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastEmail = now - lastEmailTime;
  if (timeSinceLastEmail < EMAIL_DELAY_MS) {
    const waitTime = EMAIL_DELAY_MS - timeSinceLastEmail;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastEmailTime = Date.now();
}

async function sendWithRetry(mailOptions, maxRetries = 2) {
  if (!transporter) {
    console.log('Email simulado (no hay configuración SMTP):', { to: mailOptions.to, subject: mailOptions.subject });
    return { simulated: true };
  }

  await waitForRateLimit();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      // Si es error de rate limit y no es el último intento, esperar más tiempo
      if (error.message?.includes('Too many emails') && attempt < maxRetries) {
        console.log(`Rate limit alcanzado, reintentando en ${EMAIL_DELAY_MS * 2}ms... (intento ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS * 2));
        continue;
      }
      throw error;
    }
  }
}

export async function sendQuoteEmail({ to, subject, html, attachments = [] }) {
  if (!transporter) {
    attachments.forEach(a => {
      if (a.path && fs.existsSync(a.path)) {
        console.log('PDF listo (simulado envío):', a.path);
      }
    });
    return { simulated: true };
  }

  return sendWithRetry({
    from: MAIL_FROM || 'no-reply@glds.com',
    to,
    subject,
    html,
    attachments
  });
}

export async function sendContactEmail({ to, subject, html }) {
  return sendWithRetry({
    from: MAIL_FROM || 'no-reply@glds.com',
    to,
    subject,
    html
  });
}
