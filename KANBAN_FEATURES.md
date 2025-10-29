# Vista Kanban/Pipeline de Cotizaciones

## Características Implementadas

### 🎯 Vista de Pipeline
- **5 Columnas de Estado:**
  - ⏳ Pendiente
  - 🔍 En Revisión
  - 📤 Enviada
  - ✅ Aprobada
  - 🔒 Cerrada

### 🖱️ Drag & Drop
- Arrastra cotizaciones entre columnas para cambiar su estado
- Feedback visual durante el arrastre
- Animaciones suaves y fluidas
- Soporte para teclado (accesibilidad)

### 📊 Estadísticas en Tiempo Real
- Contador total de cotizaciones
- Contadores por estado con colores distintivos
- Actualización automática al mover cotizaciones

### 🔍 Búsqueda y Filtros
- Búsqueda por código de cotización
- Búsqueda por nombre de cliente
- Búsqueda por email
- Búsqueda por empresa
- Botón para limpiar búsqueda

### 📋 Tarjetas de Cotización
Cada tarjeta muestra:
- Código de cotización
- Indicador de estado (punto de color)
- Nombre del cliente
- Email del cliente
- Empresa del cliente
- Fecha de creación
- Tiempo relativo (hace X minutos/horas/días)
- Enlace directo al PDF (si existe)

### 🎨 Diseño Visual
- Colores distintivos por estado
- Iconos representativos para cada columna
- Contador de items en cada columna
- Animaciones de entrada (slide-up)
- Efectos hover y transiciones suaves
- Diseño responsive

### 🔔 Notificaciones
- Toast notification al actualizar estado
- Mensaje de confirmación con el nuevo estado
- Auto-cierre después de 3 segundos

### ⚡ Rendimiento
- Carga optimizada de datos
- Actualizaciones locales inmediatas
- Sincronización con el servidor en segundo plano

## Tecnologías Utilizadas

- **@dnd-kit/core**: Sistema de drag & drop
- **@dnd-kit/sortable**: Ordenamiento de elementos
- **React Hooks**: Estado y efectos
- **Tailwind CSS**: Estilos y animaciones
- **Lucide React**: Iconos

## Uso

1. Navega a `/admin/quotes`
2. Arrastra cualquier tarjeta de cotización
3. Suéltala en la columna del estado deseado
4. El estado se actualizará automáticamente
5. Verás una notificación de confirmación

## Próximas Mejoras Potenciales

- [ ] Filtros avanzados por fecha
- [ ] Ordenamiento personalizado
- [ ] Vista de detalles expandida
- [ ] Edición inline de información
- [ ] Exportación de datos
- [ ] Historial de cambios de estado
- [ ] Asignación de responsables
- [ ] Comentarios en cotizaciones
