# 🔄 Migración a PostgreSQL - GLDS

## ✅ Cambios Realizados

### 1. **Base de Datos**
- ✅ Creado `server/src/db-postgres.js` - Adaptador de Postgres compatible con SQLite API
- ✅ Reemplazado `server/src/db.js` con versión Postgres
- ✅ Backup creado en `server/src/db-sqlite.js.backup`
- ✅ Convertidas todas las queries de SQLite a Postgres
- ✅ Soporte para `@vercel/postgres` y `pg` (Pool)

### 2. **Models**
- ✅ Convertidas todas las funciones a `async/await`
- ✅ Ajustados valores booleanos (INTEGER → BOOLEAN)
- ✅ Agregado `RETURNING id` en INSERTs
- ✅ Reemplazado `INSERT OR IGNORE` por `ON CONFLICT DO NOTHING`
- ✅ Eliminadas transacciones (no necesarias en Postgres)

### 3. **Dependencias**
- ✅ Agregado `@vercel/postgres` y `pg` al `package.json`
- ✅ Eliminado `better-sqlite3` (no funciona en serverless)

---

## 🚀 Pasos para Desplegar con Postgres

### **Paso 1: Instalar Dependencias**

```bash
# Ir al directorio del proyecto e instalar dependencias
cd /Users/jnolasco/Desktop/GLDS/MAIN

# Instalar dependencias del proyecto
npm install

# Instalar el CLI de Vercel (opcional pero recomendado para crear/gestionar la base de datos desde la terminal)
npm install -g vercel

# Instalar el paquete oficial para conectar con Vercel Postgres
npm install @vercel/postgres
```

### **Paso 2: Crear Base de Datos en Vercel**

#### **Opción A: Desde Vercel Dashboard (Recomendado)**

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto **glds**
3. Ve a **Storage** → **Create Database**
4. Selecciona **Postgres**
5. Nombre: `glds-db`
6. Región: Selecciona la más cercana
7. Haz clic en **Create**

Vercel agregará automáticamente estas variables de entorno:
```env
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

#### **Opción B: Desde CLI**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Link al proyecto
cd /Users/jnolasco/Desktop/GLDS/MAIN
vercel link

# Crear base de datos
vercel postgres create glds-db

# Conectar al proyecto
vercel postgres connect glds-db
```

### **Paso 3: Commit y Push**

```bash
git add .
git commit -m "Migrated to PostgreSQL for Vercel deployment"
git push
```

### **Paso 4: Verificar Variables de Entorno**

Asegúrate de tener estas variables en Vercel Dashboard:

```env
# Base de Datos (agregadas automáticamente por Vercel)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# Frontend
VITE_API_URL=https://glds.vercel.app/api

# Backend
CLIENT_URL=https://glds.vercel.app
PUBLIC_BASE_URL=https://glds.vercel.app

# JWT
JWT_SECRET=tu_secret_super_seguro
JWT_EXPIRES=7d

# Admin
ADMIN_EMAIL=admin@glds.com
ADMIN_PASSWORD=Admin123!

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=glds/products

# Email (opcional)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=tu_usuario
MAIL_PASS=tu_password
MAIL_FROM=GLDS <no-reply@glds.com>
CONTACT_EMAIL=ventas@glds.com
```

### **Paso 5: Redeploy**

Vercel hará redeploy automáticamente después del push. Espera 2-3 minutos.

### **Paso 6: Inicializar Base de Datos**

La base de datos se inicializará automáticamente en el primer request. Verifica:

```bash
# Health check
https://glds.vercel.app/api

# Debe retornar:
{
  "status": "ok",
  "message": "GLDS API is running on Vercel Serverless",
  ...
}
```

### **Paso 7: Crear Admin User**

Necesitas crear el usuario admin manualmente. Opciones:

#### **Opción A: Desde Vercel Postgres Dashboard**

1. Ve a Vercel Dashboard → Storage → glds-db
2. Haz clic en **Query**
3. Ejecuta:

```sql
INSERT INTO admins (email, password_hash)
VALUES ('admin@glds.com', '$2a$10$...');
-- Nota: Necesitas generar el hash de la contraseña con bcrypt
```

#### **Opción B: Crear endpoint temporal**

Agrega temporalmente en `server/src/routes/auth.routes.js`:

```javascript
// TEMPORAL: Crear admin
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await admins.create({ email, password_hash });
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Luego:
```bash
curl -X POST https://glds.vercel.app/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@glds.com","password":"Admin123!"}'
```

**¡IMPORTANTE!** Elimina este endpoint después de crear el admin.

---

## 🧪 Verificar que Todo Funciona

### **1. API Health Check**
```bash
https://glds.vercel.app/api
✅ Debe retornar status: ok
```

### **2. Productos**
```bash
https://glds.vercel.app/api/products
✅ Debe retornar [] (vacío al inicio)
```

### **3. Login Admin**
```bash
https://glds.vercel.app/admin
✅ Debe cargar el panel de login
```

### **4. Crear Categoría (después de login)**
```bash
POST https://glds.vercel.app/api/categories
{
  "name": "Test Category"
}
✅ Debe crear la categoría
```

---

## 🔄 Desarrollo Local con Postgres

Si quieres desarrollar localmente con Postgres:

### **Opción 1: Usar Vercel Postgres desde local**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Link al proyecto
vercel link

# Descargar variables de entorno
vercel env pull .env.local

# Usar en desarrollo
cd server
cp ../.env.local .env
npm run dev
```

### **Opción 2: Postgres local**

```bash
# Instalar Postgres
brew install postgresql@15  # macOS
# o
sudo apt install postgresql  # Linux

# Crear base de datos
createdb glds

# Agregar en server/.env
DATABASE_URL=postgresql://localhost/glds

# Iniciar servidor
cd server
npm run dev
```

---

## 📊 Diferencias SQLite vs Postgres

| Característica | SQLite | Postgres |
|----------------|--------|----------|
| **Tipos** | INTEGER, TEXT | SERIAL, VARCHAR, BOOLEAN, TIMESTAMP |
| **Booleanos** | 0/1 | TRUE/FALSE |
| **Auto-increment** | AUTOINCREMENT | SERIAL |
| **Timestamps** | TEXT | TIMESTAMP |
| **RETURNING** | No | Sí (RETURNING id) |
| **INSERT OR IGNORE** | Sí | ON CONFLICT DO NOTHING |
| **Transacciones** | db.transaction() | BEGIN/COMMIT (automático) |
| **Serverless** | ❌ No funciona | ✅ Funciona |

---

## ⚠️ Notas Importantes

### **1. Queries Asíncronas**
Todas las funciones de `models.js` ahora son `async`. Asegúrate de usar `await`:

```javascript
// ❌ Antes (SQLite)
const products = products.list();

// ✅ Ahora (Postgres)
const products = await products.list();
```

### **2. Booleanos**
Postgres usa `TRUE/FALSE` en lugar de `0/1`:

```javascript
// ❌ Antes
featured: 1

// ✅ Ahora
featured: true
```

### **3. RETURNING**
Postgres soporta `RETURNING id` en INSERTs:

```javascript
// ✅ Ahora retorna el objeto insertado
const result = await db.prepare('INSERT ... RETURNING id').get(...);
console.log(result.id);
```

### **4. Migraciones**
El esquema se crea automáticamente en el primer request. No necesitas ejecutar migraciones manualmente.

---

## 🐛 Troubleshooting

### **Error: "Database not available"**
- Verifica que `POSTGRES_URL` esté configurado en Vercel
- Verifica que la base de datos esté creada

### **Error: "relation does not exist"**
- La base de datos no se inicializó
- Verifica los logs en Vercel Dashboard
- Intenta hacer un request a `/api` para inicializar

### **Error: "syntax error at or near"**
- Alguna query no se convirtió correctamente
- Revisa los logs para ver la query específica
- Reporta el error

### **Error: "Cannot use import statement outside a module"**
- Verifica que `package.json` tenga `"type": "module"`
- Verifica que todos los imports usen `.js` al final

---

## 📝 Checklist Final

- [ ] Instalar dependencias (`npm install`)
- [ ] Crear base de datos en Vercel
- [ ] Verificar variables de entorno
- [ ] Commit y push
- [ ] Esperar redeploy (2-3 min)
- [ ] Verificar `/api` funciona
- [ ] Crear usuario admin
- [ ] Probar login
- [ ] Crear categorías y productos de prueba

---

## 🎉 ¡Listo!

Tu aplicación GLDS ahora usa PostgreSQL y está lista para Vercel serverless.

**Ventajas:**
- ✅ Funciona en Vercel serverless
- ✅ Base de datos persistente
- ✅ Escalable
- ✅ Backups automáticos
- ✅ Mejor rendimiento

**¿Necesitas ayuda?** Consulta los logs en Vercel Dashboard o pregunta.
