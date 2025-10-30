export function emailTemplate({ title, content, preheader = '' }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #ffffff;
      background-color: #0a0a0a;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-wrapper {
      width: 100%;
      background-color: #0a0a0a;
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%);
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(255, 215, 0, 0.1);
    }
    
    .email-header {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 3px solid #FFD700;
    }
    
    .logo {
      font-size: 36px;
      font-weight: 700;
      color: #0a0a0a;
      letter-spacing: 2px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .tagline {
      font-size: 12px;
      color: rgba(10, 10, 10, 0.7);
      margin-top: 8px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    .email-body {
      padding: 40px 30px;
      background-color: rgba(10, 10, 10, 0.8);
    }
    
    .content {
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      line-height: 1.8;
    }
    
    .content h1, .content h2, .content h3 {
      color: #FFD700;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    .content h1 {
      font-size: 28px;
      line-height: 1.3;
    }
    
    .content h2 {
      font-size: 22px;
      line-height: 1.4;
    }
    
    .content p {
      margin-bottom: 16px;
    }
    
    .content strong {
      color: #FFD700;
      font-weight: 600;
    }
    
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #0a0a0a !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
      transition: all 0.3s ease;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
    }
    
    .info-box {
      background: rgba(255, 215, 0, 0.1);
      border-left: 4px solid #FFD700;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }
    
    .info-box p {
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .info-box p:last-child {
      margin-bottom: 0;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
      margin: 30px 0;
    }
    
    .email-footer {
      padding: 30px;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.5);
      border-top: 1px solid rgba(255, 215, 0, 0.2);
    }
    
    .footer-text {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 12px;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #FFD700;
      text-decoration: none;
      font-size: 12px;
      transition: color 0.3s ease;
    }
    
    .social-links a:hover {
      color: #FFA500;
    }
    
    .footer-logo {
      font-size: 18px;
      font-weight: 700;
      color: #FFD700;
      letter-spacing: 1px;
      margin-top: 16px;
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      
      .email-header {
        padding: 30px 20px;
      }
      
      .logo {
        font-size: 28px;
      }
      
      .email-body {
        padding: 30px 20px;
      }
      
      .content h1 {
        font-size: 24px;
      }
      
      .button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#0a0a0a;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <div class="logo">GLDS</div>
        <div class="tagline">Grupo Los Dos</div>
      </div>

      <div class="email-body">
        <div class="content">
          ${content}
        </div>
      </div>

      <div class="email-footer">
        <p class="footer-text">
          Este correo fue enviado por GLDS<br>
          Si tienes alguna pregunta, contáctanos respondiendo a este correo.
        </p>
        
        <div class="social-links">
          <a href="https://glds.com">Sitio Web</a> •
          <a href="mailto:ventas@glds.com">Contacto</a>
        </div>
        
        <div class="footer-logo">GLDS</div>
        
        <p class="footer-text" style="margin-top: 16px; font-size: 11px;">
          © ${new Date().getFullYear()} GLDS. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
