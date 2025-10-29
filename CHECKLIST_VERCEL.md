# ✅ Checklist de Despliegue en Vercel - GLDS

## 📦 Archivos de Configuración Creados

- ✅ `vercel.json` - Configuración de Vercel
- ✅ `.vercelignore` - Archivos a ignorar en el deploy
- ✅ `.env.example` - Plantilla de variables de entorno
- ✅ `DEPLOY_VERCEL.md` - Guía completa de despliegue
- ✅ `QUICKSTART_VERCEL.md` - Guía rápida (5 minutos)
- ✅ `api/index.js` - Handler serverless para Vercel
- ✅ `package.json` (raíz) - Scripts de monorepo
- ✅ `web/package.json` - Script vercel-build agregado

---

## 🎯 Pasos para Desplegar

### ✅ Paso 1: Preparar Repositorio
```bash
# 1. Inicializar git (si no está)
git init

# 2. Agregar archivos
git add .

# 3. Commit
git commit -m "Ready for Vercel deployment"

# 4. Crear repositorio en GitHub
# Ve a: https://github.com/new

# 5. Conectar y subir
git remote add origin https://github.com/TU_USUARIO/glds.git
git branch -M main
git push -u origin main
```

### ✅ Paso 2: Configurar Vercel
```bash
# Opción A: Desde la Web (Recomendado)
1. Ve a: https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Configura:
   - Framework: Other
   - Root Directory: ./
   - Build Command: npm run vercel-build
   - Output Directory: web/dist

# Opción B: Desde CLI
npm install -g vercel
vercel login
vercel
```

### ✅ Paso 3: Variables de Entorno
Agrega estas variables en Vercel Dashboard:

**Backend (Server):**
```env
JWT_SECRET=genera_un_secret_seguro_aqui
JWT_EXPIRES=7d
ADMIN_EMAIL=admin@glds.com
ADMIN_PASSWORD=TuPasswordSeguro123!
CLIENT_URL=https://tu-dominio.vercel.app
PUBLIC_BASE_URL=https://tu-dominio.vercel.app
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=tu_usuario_mailtrap
MAIL_PASS=tu_password_mailtrap
MAIL_FROM="GLDS <no-reply@glds.com>"
CONTACT_EMAIL=ventas@glds.com
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=glds/products
```

**Frontend (Web):**
```env
VITE_API_URL=https://tu-dominio.vercel.app/api
```

### ✅ Paso 4: Deploy
```bash
# Desde Vercel Dashboard
Clic en "Deploy" → Esperar 2-3 minutos

# O desde CLI
vercel --prod
```

### ✅ Paso 5: Actualizar URLs
Después del primer deploy:
1. Copia la URL de Vercel (ej: `https://glds-abc123.vercel.app`)
2. Actualiza en Vercel Dashboard:
   ```env
   CLIENT_URL=https://glds-abc123.vercel.app
   PUBLIC_BASE_URL=https://glds-abc123.vercel.app
   VITE_API_URL=https://glds-abc123.vercel.app/api
   ```
3. Redeploy

### ✅ Paso 6: Configurar Base de Datos
⚠️ **CRÍTICO**: SQLite no funciona en Vercel

**Opciones:**
- **Vercel Postgres** (Recomendado): `vercel postgres create`
- **Turso** (SQLite en la nube): https://turso.tech
- **PlanetScale** (MySQL): https://planetscale.com

### ✅ Paso 7: Verificar
```bash
# Frontend
✅ https://tu-dominio.vercel.app

# API
✅ https://tu-dominio.vercel.app/api/products

# Admin
✅ https://tu-dominio.vercel.app/admin
```

---

## 🔍 Verificación Post-Deploy

### Frontend
- [ ] Página principal carga
- [ ] Imágenes se muestran
- [ ] Navegación funciona
- [ ] Formulario de contacto funciona
- [ ] Carrito de cotizaciones funciona
- [ ] Tracking de cotizaciones funciona

### Backend API
- [ ] `/api/products` responde
- [ ] `/api/categories` responde
- [ ] `/api/auth/login` funciona
- [ ] Correos se envían
- [ ] PDFs se generan

### Admin Panel
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] CRUD de productos funciona
- [ ] CRUD de categorías funciona
- [ ] Kanban de cotizaciones funciona
- [ ] Socket.io conecta

---

## ⚠️ Problemas Comunes y Soluciones

### "Module not found"
```bash
# Instalar todas las dependencias
npm run install:all
```

### "Environment variable not found"
```bash
# Verificar en Vercel Dashboard
vercel env ls

# Agregar las que falten
vercel env add VARIABLE_NAME
```

### "Database error"
```bash
# SQLite no funciona en Vercel
# Migrar a Vercel Postgres, Turso o PlanetScale
```

### "CORS error"
```bash
# Verificar que CLIENT_URL sea exacto
# Debe incluir https:// y sin / al final
```

### "Socket.io not connecting"
```bash
# Vercel tiene limitaciones con WebSockets
# Considerar usar Vercel Edge Functions
# O servidor separado para WebSockets
```

### "Build failed"
```bash
# Ver logs en Vercel Dashboard
# O ejecutar localmente:
npm run vercel-build
```

---

## 📊 Monitoreo

### Vercel Analytics
1. Dashboard → Analytics
2. Habilitar Web Analytics
3. Ver métricas en tiempo real

### Logs
```bash
# Ver logs en tiempo real
vercel logs

# Ver logs de un deployment específico
vercel logs [deployment-url]
```

---

## 🚀 Optimizaciones Post-Deploy

### 1. Dominio Personalizado
- Vercel Dashboard → Settings → Domains
- Agregar: `www.glds.com`
- Configurar DNS según instrucciones

### 2. HTTPS/SSL
- ✅ Automático con Vercel
- Certificado SSL gratis

### 3. CDN
- ✅ Automático con Vercel
- Edge Network global

### 4. Caching
- Configurar headers en `vercel.json`
- Optimizar imágenes con Cloudinary

### 5. Performance
- Instalar `@vercel/speed-insights`
- Monitorear Core Web Vitals

---

## 📞 Recursos

- 📖 **Guía Completa**: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)
- ⚡ **Guía Rápida**: [QUICKSTART_VERCEL.md](./QUICKSTART_VERCEL.md)
- 🌐 **Docs Vercel**: https://vercel.com/docs
- 💬 **Discord Vercel**: https://vercel.com/discord
- 🐛 **Issues**: https://github.com/vercel/vercel/issues

---

## 🎉 ¡Felicidades!

Tu aplicación GLDS está desplegada en Vercel.

**URLs:**
- 🌐 Frontend: `https://tu-dominio.vercel.app`
- 🔌 API: `https://tu-dominio.vercel.app/api`
- 👨‍💼 Admin: `https://tu-dominio.vercel.app/admin`

**Próximos pasos:**
1. ✅ Configurar base de datos en la nube
2. ✅ Configurar dominio personalizado
3. ✅ Configurar SMTP real
4. ✅ Habilitar analytics
5. ✅ Configurar backups

---

**¿Listo para desplegar?** Sigue los pasos arriba o usa la [guía rápida](./QUICKSTART_VERCEL.md).
