# 🔧 Inicializar Usuario Admin

## **Cambios Aplicados**

✅ Arreglado error del carrito (`n.slice is not a function`)
✅ Mejorado login con async/await
✅ Creado endpoint para inicializar admin
✅ Commit y push completados

---

## **Paso 1: Esperar Deploy (2-3 min)**

Ve a: https://vercel.com/dashboard

Espera a que el deploy esté **🟢 Ready**

---

## **Paso 2: Crear Usuario Admin**

### **Opción A: Usando curl (Recomendado)**

```bash
curl -X POST https://glds.vercel.app/api/init-admin \
  -H "Authorization: Bearer init-secret-2024" \
  -H "Content-Type: application/json"
```

### **Opción B: Usando el navegador**

1. Abre la consola del navegador (F12)
2. Pega este código:

```javascript
fetch('https://glds.vercel.app/api/init-admin', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer init-secret-2024',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Admin creado:', data))
.catch(err => console.error('❌ Error:', err));
```

### **Respuesta Esperada:**

```json
{
  "message": "Admin user created successfully",
  "admin": {
    "id": 1,
    "email": "admin@glds.com",
    "created_at": "2024-10-29T22:30:00.000Z"
  },
  "note": "You can now login with these credentials"
}
```

---

## **Paso 3: Verificar Variables de Entorno**

Ve a Vercel Dashboard → **Settings** → **Environment Variables**

Verifica que existan:

- ✅ `ADMIN_EMAIL` (ej: `admin@glds.com`)
- ✅ `ADMIN_PASSWORD` (ej: `admin123`)

Si no existen, agrégalas:

1. **Key**: `ADMIN_EMAIL`
   **Value**: `admin@glds.com`

2. **Key**: `ADMIN_PASSWORD`
   **Value**: `admin123` (o el que prefieras)

3. **Key**: `INIT_SECRET`
   **Value**: `init-secret-2024`

4. Haz clic en **Save**

5. **Redeploy** el proyecto (Deployments → ... → Redeploy)

---

## **Paso 4: Probar Login**

1. Ve a: https://glds.vercel.app/admin
2. Ingresa:
   - **Email**: `admin@glds.com`
   - **Password**: `admin123` (o el que configuraste)
3. Haz clic en **Login**

✅ Deberías entrar al panel de admin

---

## **Paso 5: Probar Landing y Cart**

1. Ve a: https://glds.vercel.app
2. Navega por el sitio
3. Ve a: https://glds.vercel.app/cart

✅ No debería haber errores de `n.slice is not a function`

---

## **Troubleshooting**

### **Si el admin ya existe:**

```json
{
  "message": "Admin user already exists",
  "email": "admin@glds.com",
  "id": 1
}
```

✅ Perfecto! Ya puedes hacer login.

### **Si falla el login:**

1. Verifica que las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` estén configuradas
2. Redeploy el proyecto
3. Vuelve a ejecutar `/api/init-admin`

### **Si sigue el error del carrito:**

1. Abre la consola del navegador (F12)
2. Ejecuta:
   ```javascript
   localStorage.removeItem('glds_cart_v2');
   location.reload();
   ```

---

## **Checklist**

- [ ] Deploy completado (🟢 Ready)
- [ ] Variables de entorno configuradas
- [ ] Usuario admin creado (`/api/init-admin`)
- [ ] Login funciona
- [ ] Landing y cart sin errores

---

## **Próximos Pasos**

Una vez que todo funcione:

1. **Crear categorías** (ej: Textil, Tecnología, Oficina)
2. **Crear productos** con imágenes
3. **Probar cotizaciones**

---

**Tiempo estimado:** 5 minutos

**¿Problemas?** Comparte los logs de Vercel o los errores de la consola.
