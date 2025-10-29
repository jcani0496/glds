# 🔍 Verificar Logs en Vercel

## **Cambios Realizados**

✅ Actualizado `vercel.json` para incluir archivos de `server/` en el bundle
✅ Mejorado `api/index.js` con mejor manejo de errores y logging
✅ Commit y push completados

---

## **Verificar el Deploy**

### **1. Ver el Deploy en Progreso**

Ve a: https://vercel.com/dashboard

Deberías ver:
- 🟡 **Building** (1-2 min)
- 🟢 **Ready** (cuando termine)

### **2. Ver los Logs**

1. Haz clic en el deploy más reciente
2. Ve a la pestaña **Logs** o **Runtime Logs**
3. Busca estos mensajes:

```
✅ Using Vercel Postgres
🔄 Initializing database schema...
✅ Database schema initialized successfully
🔄 Loading routes...
✅ Auth routes loaded
✅ Products routes loaded
✅ Categories routes loaded
...
✅ All routes initialized
```

### **3. Probar el API**

Después de que el deploy esté **Ready**:

#### **Health Check**
```bash
https://glds.vercel.app/api
```

Debe retornar:
```json
{
  "status": "ok",
  "message": "GLDS API is running on Vercel Serverless",
  "env": {
    "hasDatabase": true,
    ...
  }
}
```

#### **Probar Login**
```bash
https://glds.vercel.app/admin
```

Intenta hacer login. Si ves el mismo error 500, revisa los logs.

---

## **Si Sigue Fallando**

### **Opción 1: Ver Logs en Tiempo Real**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Ver logs en tiempo real
vercel logs glds --follow
```

### **Opción 2: Verificar Variables de Entorno**

1. Ve a Vercel Dashboard → tu proyecto **glds**
2. **Settings** → **Environment Variables**
3. Verifica que existan:
   - ✅ `POSTGRES_URL`
   - ✅ `JWT_SECRET`
   - ✅ `CLIENT_URL`
   - ✅ `ADMIN_EMAIL`
   - ✅ `ADMIN_PASSWORD`

### **Opción 3: Verificar que los Archivos se Incluyeron**

En los logs de build, busca:
```
Including files: server/**
```

Si no aparece, el problema es que Vercel no está incluyendo los archivos.

---

## **Solución Alternativa: Copiar Rutas a api/**

Si `includeFiles` no funciona, podemos copiar las rutas directamente a `api/`:

```bash
# Crear estructura
mkdir -p api/routes

# Copiar rutas
cp server/src/routes/*.js api/routes/
cp -r server/src api/

# Actualizar imports en api/index.js
# Cambiar: '../server/src/routes/auth.routes.js'
# Por: './routes/auth.routes.js'
```

Pero **espera primero** a ver si el deploy actual funciona.

---

## **Checklist**

- [ ] Deploy completado (🟢 Ready)
- [ ] Logs muestran "✅ All routes initialized"
- [ ] `/api` retorna `{"status":"ok"}`
- [ ] Login funciona sin error 500

---

## **Próximos Pasos**

Una vez que el API funcione:

1. **Crear usuario admin** (ver `MIGRATION_POSTGRES.md`)
2. **Probar login**
3. **Crear categorías y productos de prueba**

---

**Tiempo estimado:** 2-3 minutos para el deploy

**¿Sigue fallando?** Comparte los logs de Vercel y te ayudo a diagnosticar.
