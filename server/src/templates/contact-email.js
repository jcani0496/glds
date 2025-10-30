import { emailTemplate } from './email-base.js';

export function contactEmailToAdmin({ name, email, phone, company, message }) {
  const content = `
    <h1>📬 Nuevo mensaje de contacto</h1>
    <p>Has recibido un nuevo mensaje desde el formulario de contacto de tu sitio web.</p>
    
    <div class="info-box">
      <p><strong>👤 Nombre:</strong> ${name}</p>
      <p><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #FFD700;">${email}</a></p>
      <p><strong>📱 Teléfono:</strong> ${phone || 'No proporcionado'}</p>
      <p><strong>🏢 Empresa:</strong> ${company || 'No proporcionada'}</p>
    </div>
    
    <div class="divider"></div>
    
    <h3>💬 Mensaje:</h3>
    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; margin-top: 16px;">
      <p style="white-space: pre-wrap; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: rgba(255, 255, 255, 0.6);">
      💡 <strong>Tip:</strong> Responde directamente a este correo para contactar al cliente.
    </p>
  `;

  return emailTemplate({
    title: `Nuevo mensaje de contacto - ${name}`,
    preheader: `${name} te ha enviado un mensaje desde tu sitio web`,
    content
  });
}

export function contactConfirmationToCustomer({ name, message }) {
  const content = `
    <h1>✨ ¡Gracias por contactarnos, ${name}!</h1>
    <p>Hemos recibido tu mensaje y nuestro equipo lo está revisando.</p>
    <p>Nos pondremos en contacto contigo lo antes posible, generalmente en menos de 24 horas hábiles.</p>
    
    <div class="divider"></div>
    
    <h3>📝 Tu mensaje:</h3>
    <div style="background: rgba(255, 215, 0, 0.05); border-left: 3px solid #FFD700; padding: 20px; margin-top: 16px; border-radius: 4px;">
      <p style="white-space: pre-wrap; margin: 0; color: rgba(255, 255, 255, 0.8);">${message.replace(/\n/g, '<br>')}</p>
    </div>
    
    <div class="divider"></div>
    
    <p>Mientras tanto, si tienes alguna pregunta urgente, no dudes en llamarnos o escribirnos directamente.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:ventas@glds.com" class="button">📧 Contáctanos por Email</a>
    </div>
    
    <p style="text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.6);">
      ¿Necesitas ayuda inmediata? Visita nuestro <a href="${process.env.PUBLIC_BASE_URL || 'https://glds.com'}" style="color: #FFD700;">sitio web</a>
    </p>
  `;

  return emailTemplate({
    title: 'Hemos recibido tu mensaje - GLDS',
    preheader: 'Gracias por contactarnos. Te responderemos pronto.',
    content
  });
}
