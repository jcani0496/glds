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

export async function sendQuoteEmail({ to, subject, html, attachments = [] }) {
  if (!transporter) {
    // Fallback: guardar adjuntos y "simular" envío
    attachments.forEach(a => {
      if (a.path && fs.existsSync(a.path)) {
        console.log('PDF listo (simulado envío):', a.path);
      }
    });
    return { simulated: true };
  }
  return transporter.sendMail({ from: MAIL_FROM || 'no-reply@glds.com', to, subject, html, attachments });
}

export async function sendContactEmail({ to, subject, html }) {
  if (!transporter) {
    console.log('Email simulado (no hay configuración SMTP):', { to, subject });
    return { simulated: true };
  }
  return transporter.sendMail({ from: MAIL_FROM || 'no-reply@glds.com', to, subject, html });
}
