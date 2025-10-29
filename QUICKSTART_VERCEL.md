# 🚀 Despliegue Rápido en Vercel - GLDS

## ⚡ Pasos Rápidos (5 minutos)

### 1️⃣ Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/glds.git
git push -u origin main
```

### 2️⃣ Conectar con Vercel
1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Vercel detectará automáticamente la configuración de `vercel.json`
4. Haz clic en **"Deploy"** (no necesitas cambiar nada)

### 3️⃣ Agregar Variables de Entorno
En Vercel Dashboard → Settings → Environment Variables:

```env
# JWT
JWT_SECRET=tu_secret_super_seguro_aqui
JWT_EXPIRES=7d

# Admin
ADMIN_EMAIL=admin@glds.com
ADMIN_PASSWORD=Admin123!

# CORS (actualizar después del deploy)
CLIENT_URL=https://tu-dominio.vercel.app
PUBLIC_BASE_URL=https://tu-dominio.vercel.app

# Email
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=tu_usuario_mailtrap
MAIL_PASS=tu_password_mailtrap
MAIL_FROM="GLDS <no-reply@glds.com>"
CONTACT_EMAIL=ventas@glds.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=glds/products

# Frontend
VITE_API_URL=https://tu-dominio.vercel.app/api
```

### 4️⃣ Deploy
- Haz clic en **"Deploy"**
- Espera 2-3 minutos
- ¡Listo! 🎉

### 5️⃣ Actualizar URLs
Después del primer deploy:
1. Copia la URL que te dio Vercel (ej: `https://glds-abc123.vercel.app`)
2. Actualiza estas variables en Vercel:
   ```env
   CLIENT_URL=https://glds-abc123.vercel.app
   PUBLIC_BASE_URL=https://glds-abc123.vercel.app
   VITE_API_URL=https://glds-abc123.vercel.app/api
   ```
3. Haz clic en **"Redeploy"**

---

## ⚠️ IMPORTANTE: Base de Datos

SQLite NO funciona en Vercel (serverless). Opciones:

### Opción A: Vercel Postgres (Recomendado)
```bash
vercel postgres create
```

### Opción B: Turso (SQLite en la nube)
1. Crear cuenta: https://turso.tech
2. Crear DB y obtener URL
3. Actualizar código para usar Turso

### Opción C: PlanetScale (MySQL)
1. Crear cuenta: https://planetscale.com
2. Crear DB
3. Migrar de SQLite a MySQL

---

## 🧪 Verificar Despliegue

```bash
# Frontend
https://tu-dominio.vercel.app

# API
https://tu-dominio.vercel.app/api/products

# Admin
https://tu-dominio.vercel.app/admin
```

---

## 📚 Documentación Completa

Para más detalles, ver: **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)**

---

## 🆘 Problemas Comunes

### "Module not found"
```bash
npm run install:all
```

### "Environment variable not found"
Verifica que todas las variables estén en Vercel Dashboard

### "Database error"
Migra a Vercel Postgres o Turso (SQLite no funciona en serverless)

### "CORS error"
Verifica que `CLIENT_URL` sea exactamente la URL de tu frontend

---

## 🎉 ¡Listo!

Tu app está en: `https://tu-dominio.vercel.app`

**Próximos pasos:**
1. ✅ Configurar base de datos en la nube
2. ✅ Configurar dominio personalizado
3. ✅ Configurar SMTP real para emails
4. ✅ Habilitar analytics

---

**¿Necesitas ayuda?** Ver [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) para guía completa.
