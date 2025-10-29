# 🚀 Guía de Despliegue en Vercel - GLDS

## 📋 Requisitos Previos

1. ✅ Cuenta en [Vercel](https://vercel.com) (gratis)
2. ✅ Cuenta en [GitHub](https://github.com) (para conectar el repositorio)
3. ✅ Cuenta en [Cloudinary](https://cloudinary.com) (para imágenes)
4. ✅ Cuenta en [Mailtrap](https://mailtrap.io) o servicio SMTP real

---

## 🎯 Paso 1: Preparar el Repositorio en GitHub

### 1.1 Crear repositorio en GitHub
```bash
# Si aún no tienes un repositorio, créalo en GitHub
# Luego, en tu terminal local:

cd /Users/jnolasco/Desktop/GLDS/MAIN

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - GLDS MVP"

# Conectar con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/jcani0496/glds.git

# Subir a GitHub
git branch -M main
git push -u origin main
```

### 1.2 Verificar archivos importantes
Asegúrate de que estos archivos estén en el repositorio:
- ✅ `vercel.json` (configuración de Vercel)
- ✅ `.vercelignore` (archivos a ignorar)
- ✅ `.env.example` (plantilla de variables de entorno)
- ✅ `.gitignore` (para no subir archivos sensibles)

---

## 🎯 Paso 2: Configurar Variables de Entorno

Antes de desplegar, prepara estas variables de entorno:

### Backend (Server)
```env
# JWT
JWT_SECRET=genera_un_secret_seguro_aqui
JWT_EXPIRES=7d

# Admin
ADMIN_EMAIL=admin@glds.com
ADMIN_PASSWORD=TuPasswordSeguro123!

# CORS
CLIENT_URL=https://tu-dominio.vercel.app

# Email (Mailtrap o SMTP real)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=tu_usuario
MAIL_PASS=tu_password
MAIL_FROM="GLDS <no-reply@glds.com>"
CONTACT_EMAIL=ventas@glds.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=glds/products

# URL pública
PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

### Frontend (Web)
```env
VITE_API_URL=https://tu-dominio.vercel.app/api
```

---

## 🎯 Paso 3: Desplegar en Vercel

### Opción A: Desde la Web de Vercel (Recomendado)

1. **Ir a Vercel Dashboard**
   - Visita: https://vercel.com/dashboard
   - Haz clic en **"Add New..."** → **"Project"**

2. **Importar Repositorio**
   - Selecciona **"Import Git Repository"**
   - Conecta tu cuenta de GitHub si no lo has hecho
   - Busca y selecciona tu repositorio `glds`
   - Haz clic en **"Import"**

3. **Configurar el Proyecto**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (dejar vacío o "npm run build")
   Output Directory: web/dist
   Install Command: npm install
   ```

4. **Agregar Variables de Entorno**
   - En la sección **"Environment Variables"**
   - Agrega TODAS las variables del paso 2
   - Marca las que son sensibles como "Sensitive"
   - Puedes agregar diferentes valores para:
     - Production
     - Preview
     - Development

5. **Desplegar**
   - Haz clic en **"Deploy"**
   - Espera 2-5 minutos
   - ¡Listo! 🎉

### Opción B: Desde la Terminal (CLI)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login en Vercel
vercel login

# Desplegar (desde la raíz del proyecto)
cd /Users/jnolasco/Desktop/GLDS/MAIN
vercel

# Seguir las instrucciones:
# - Set up and deploy? Yes
# - Which scope? (tu cuenta)
# - Link to existing project? No
# - Project name? glds
# - In which directory is your code located? ./
# - Want to override settings? No

# Agregar variables de entorno
vercel env add JWT_SECRET
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
# ... (repetir para todas las variables)

# Desplegar a producción
vercel --prod
```

---

## 🎯 Paso 4: Configurar Dominios y URLs

### 4.1 Obtener URLs de Vercel
Después del despliegue, Vercel te dará URLs como:
- **Frontend**: `https://glds-abc123.vercel.app`
- **Backend API**: `https://glds-abc123.vercel.app/api`

### 4.2 Actualizar Variables de Entorno
Vuelve a Vercel Dashboard y actualiza:

```env
# En el proyecto de Vercel
CLIENT_URL=https://glds-abc123.vercel.app
PUBLIC_BASE_URL=https://glds-abc123.vercel.app
VITE_API_URL=https://glds-abc123.vercel.app/api
```

### 4.3 Re-desplegar
- Haz clic en **"Redeploy"** en Vercel Dashboard
- O haz un nuevo commit y push a GitHub

---

## 🎯 Paso 5: Configurar Base de Datos

⚠️ **IMPORTANTE**: Vercel es serverless, por lo que SQLite no persistirá entre despliegues.

### Opciones para Base de Datos en Producción:

#### Opción A: Vercel Postgres (Recomendado)
```bash
# Instalar Vercel Postgres
vercel postgres create

# Conectar al proyecto
vercel link

# Obtener credenciales
vercel env pull
```

#### Opción B: Turso (SQLite en la nube)
1. Crear cuenta en https://turso.tech
2. Crear base de datos
3. Obtener URL y token
4. Actualizar código para usar Turso

#### Opción C: PlanetScale (MySQL)
1. Crear cuenta en https://planetscale.com
2. Crear base de datos
3. Obtener connection string
4. Migrar de SQLite a MySQL

---

## 🎯 Paso 6: Verificar el Despliegue

### 6.1 Probar el Frontend
```bash
# Visita tu URL de Vercel
https://tu-dominio.vercel.app

# Verifica:
✅ La página carga correctamente
✅ Las imágenes se muestran
✅ La navegación funciona
✅ El formulario de contacto funciona
✅ El carrito de cotizaciones funciona
```

### 6.2 Probar el Backend
```bash
# Prueba el API
curl https://tu-dominio.vercel.app/api/products

# Verifica:
✅ El API responde
✅ Los productos se cargan
✅ La autenticación funciona
✅ Los correos se envían
```

### 6.3 Probar el Admin
```bash
# Visita el panel admin
https://tu-dominio.vercel.app/admin

# Login con:
Email: admin@glds.com
Password: (el que configuraste en ADMIN_PASSWORD)

# Verifica:
✅ Login funciona
✅ Puedes ver productos
✅ Puedes ver cotizaciones
✅ El Kanban funciona
✅ Socket.io funciona
```

---

## 🎯 Paso 7: Configurar Dominio Personalizado (Opcional)

### 7.1 En Vercel Dashboard
1. Ve a tu proyecto
2. Clic en **"Settings"** → **"Domains"**
3. Agrega tu dominio: `www.glds.com`
4. Sigue las instrucciones para configurar DNS

### 7.2 Actualizar Variables de Entorno
```env
CLIENT_URL=https://www.glds.com
PUBLIC_BASE_URL=https://www.glds.com
VITE_API_URL=https://www.glds.com/api
```

---

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs

# Ver deployments
vercel ls

# Eliminar deployment
vercel rm [deployment-url]

# Ver variables de entorno
vercel env ls

# Agregar variable de entorno
vercel env add VARIABLE_NAME

# Eliminar variable de entorno
vercel env rm VARIABLE_NAME

# Re-desplegar
vercel --prod
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Module not found"
```bash
# Asegúrate de que todas las dependencias estén en package.json
cd server && npm install
cd ../web && npm install
```

### Error: "Environment variable not found"
```bash
# Verifica que todas las variables estén configuradas
vercel env ls

# Agrega las que falten
vercel env add VARIABLE_NAME
```

### Error: "Database not found"
```bash
# SQLite no funciona en Vercel serverless
# Migra a Vercel Postgres, Turso o PlanetScale
```

### Error: "CORS policy"
```bash
# Verifica que CLIENT_URL esté correctamente configurado
# Debe ser la URL exacta de tu frontend en Vercel
```

### Error: "Socket.io not connecting"
```bash
# Vercel tiene limitaciones con WebSockets
# Considera usar Vercel Edge Functions o un servidor separado
```

---

## 📊 Monitoreo y Analytics

### Vercel Analytics (Gratis)
1. Ve a tu proyecto en Vercel
2. Clic en **"Analytics"**
3. Habilita **"Web Analytics"**

### Vercel Speed Insights
1. Instala el paquete:
```bash
cd web
npm install @vercel/speed-insights
```

2. Agrega al código:
```javascript
// web/src/main.jsx
import { SpeedInsights } from '@vercel/speed-insights/react';

// En tu componente raíz
<SpeedInsights />
```

---

## 🎉 ¡Listo!

Tu aplicación GLDS ahora está desplegada en Vercel.

**URLs importantes:**
- 🌐 Frontend: `https://tu-dominio.vercel.app`
- 🔌 API: `https://tu-dominio.vercel.app/api`
- 👨‍💼 Admin: `https://tu-dominio.vercel.app/admin`

**Próximos pasos:**
1. ✅ Configurar dominio personalizado
2. ✅ Migrar a base de datos en la nube
3. ✅ Configurar SMTP real para emails
4. ✅ Habilitar analytics
5. ✅ Configurar backups automáticos

---

## 📞 Soporte

- 📖 Documentación Vercel: https://vercel.com/docs
- 💬 Discord Vercel: https://vercel.com/discord
- 🐛 Issues: https://github.com/vercel/vercel/issues

---

**¡Felicidades por tu despliegue! 🚀**
