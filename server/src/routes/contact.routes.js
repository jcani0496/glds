import express from 'express';
import { sendContactEmail } from '../mailer.js';
import { contactEmailToAdmin, contactConfirmationToCustomer } from '../templates/contact-email.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Campos requeridos: name, email, message' });
    }

    let emailsSent = 0;
    let emailErrors = [];

    // Enviar email al admin
    try {
      await sendContactEmail({
        to: process.env.CONTACT_EMAIL || 'ventas@glds.com',
        subject: `Nuevo mensaje de contacto - ${name}`,
        html: contactEmailToAdmin({ name, email, phone, company, message }),
      });
      emailsSent++;
      console.log(`✓ Email enviado al admin (${process.env.CONTACT_EMAIL || 'ventas@glds.com'})`);
    } catch (emailError) {
      console.error('✗ Error al enviar email al admin:', emailError.message);
      emailErrors.push({ recipient: 'admin', error: emailError.message });
    }

    // Enviar email de confirmación al cliente
    try {
      await sendContactEmail({
        to: email,
        subject: 'Hemos recibido tu mensaje - GLDS',
        html: contactConfirmationToCustomer({ name, message }),
      });
      emailsSent++;
      console.log(`✓ Email de confirmación enviado a ${email}`);
    } catch (emailError) {
      console.error('✗ Error al enviar email de confirmación:', emailError.message);
      emailErrors.push({ recipient: 'cliente', error: emailError.message });
    }

    // Log del mensaje recibido
    console.log('📧 Mensaje de contacto recibido:', { name, email, phone, company, message });

    // Responder con éxito incluso si los emails fallaron (el mensaje se guardó en logs)
    res.json({
      success: true,
      message: 'Mensaje recibido correctamente',
      emailsSent,
      emailErrors: emailErrors.length > 0 ? emailErrors : undefined
    });
  } catch (error) {
    console.error('Error en formulario de contacto:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje' });
  }
});

export default router;