import express from 'express';
import { sendContactEmail } from '../mailer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Campos requeridos: name, email, message' });
    }

    const emailContent = `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
      <p><strong>Empresa:</strong> ${company || 'No proporcionada'}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const confirmationEmail = `
      <h2>Gracias por contactarnos, ${name}</h2>
      <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.</p>
      <p><strong>Tu mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <br>
      <p>Saludos,<br>Equipo GLDS</p>
    `;

    try {
      await sendContactEmail({
        to: process.env.CONTACT_EMAIL || 'ventas@glds.com',
        subject: `Nuevo mensaje de contacto - ${name}`,
        html: emailContent,
      });

      await sendContactEmail({
        to: email,
        subject: 'Hemos recibido tu mensaje - GLDS',
        html: confirmationEmail,
      });
    } catch (emailError) {
      console.error('Error al enviar email (simulando envío):', emailError.message);
      console.log('Mensaje de contacto recibido:', { name, email, phone, company, message });
    }

    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error en formulario de contacto:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

export default router;
