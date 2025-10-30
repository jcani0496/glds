import { emailTemplate } from './email-base.js';

export function quoteEmailWithCloudinary({ customer_name, code, pdfUrl, trackingUrl }) {
  const content = `
    <h1>🎉 Tu cotización está lista, ${customer_name}</h1>
    <p>Nos complace informarte que hemos preparado tu cotización personalizada.</p>
    
    <div class="info-box">
      <p><strong>📋 Código de cotización:</strong> ${code}</p>
      <p><strong>📅 Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}</p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${pdfUrl}" class="button" style="margin-right: 10px;">📄 Descargar PDF</a>
      <a href="${trackingUrl}" class="button" style="background: rgba(255, 215, 0, 0.2); color: #FFD700 !important; border: 2px solid #FFD700;">🔍 Ver Estado</a>
    </div>
    
    <div class="divider"></div>
    
    <h3>📦 ¿Qué sigue?</h3>
    <div style="background: rgba(255, 215, 0, 0.05); padding: 20px; border-radius: 8px; margin-top: 16px;">
      <p style="margin-bottom: 12px;">✅ <strong>Revisa tu cotización</strong> - Descarga el PDF y revisa todos los detalles</p>
      <p style="margin-bottom: 12px;">💬 <strong>¿Tienes preguntas?</strong> - Responde a este correo o contáctanos</p>
      <p style="margin-bottom: 0;">🚀 <strong>¿Listo para continuar?</strong> - Confirma tu pedido y comenzaremos de inmediato</p>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 14px; color: rgba(255, 255, 255, 0.7);">
      💡 <strong>Tip:</strong> Puedes hacer seguimiento del estado de tu cotización en cualquier momento usando el enlace "Ver Estado" de arriba.
    </p>
    
    <p style="margin-top: 30px;">
      Gracias por confiar en GLDS para tus necesidades de logística y distribución.
    </p>
  `;

  return emailTemplate({
    title: `GLDS – Cotización ${code}`,
    preheader: `Tu cotización ${code} está lista para descargar`,
    content
  });
}

export function quoteEmailWithAttachment({ customer_name, code, trackingUrl }) {
  const content = `
    <h1>🎉 Tu cotización está lista, ${customer_name}</h1>
    <p>Nos complace informarte que hemos preparado tu cotización personalizada.</p>
    
    <div class="info-box">
      <p><strong>📋 Código de cotización:</strong> ${code}</p>
      <p><strong>📅 Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}</p>
      <p><strong>📎 Archivo adjunto:</strong> ${code}.pdf</p>
    </div>
    
    <p style="background: rgba(255, 215, 0, 0.1); padding: 16px; border-radius: 8px; border-left: 4px solid #FFD700; margin: 24px 0;">
      📄 <strong>Tu cotización está adjunta a este correo</strong> - Descárgala para ver todos los detalles
    </p>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="${trackingUrl}" class="button">🔍 Ver Estado de la Cotización</a>
    </div>
    
    <div class="divider"></div>
    
    <h3>📦 ¿Qué sigue?</h3>
    <div style="background: rgba(255, 215, 0, 0.05); padding: 20px; border-radius: 8px; margin-top: 16px;">
      <p style="margin-bottom: 12px;">✅ <strong>Revisa tu cotización</strong> - Abre el archivo PDF adjunto</p>
      <p style="margin-bottom: 12px;">💬 <strong>¿Tienes preguntas?</strong> - Responde a este correo o contáctanos</p>
      <p style="margin-bottom: 0;">🚀 <strong>¿Listo para continuar?</strong> - Confirma tu pedido y comenzaremos de inmediato</p>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 14px; color: rgba(255, 255, 255, 0.7);">
      💡 <strong>Tip:</strong> Puedes hacer seguimiento del estado de tu cotización en cualquier momento usando el enlace de arriba.
    </p>
    
    <p style="margin-top: 30px;">
      Gracias por confiar en GLDS para tus necesidades de logística y distribución.
    </p>
  `;

  return emailTemplate({
    title: `GLDS – Cotización ${code}`,
    preheader: `Tu cotización ${code} está adjunta en este correo`,
    content
  });
}
