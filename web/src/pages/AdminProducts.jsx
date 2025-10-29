import { useEffect, useState } from 'react';
import { Trash2, Edit2, Star, Image as ImageIcon, Upload } from 'lucide-react';
import api from '../lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file) {
  if (!CLOUD || !PRESET) {
    throw new Error("Configura VITE_CLOUDINARY_CLOUD y VITE_CLOUDINARY_UPLOAD_PRESET en el .env del frontend.");
  }
  const url = `https://api.cloudinary.com/v1_1/${CLOUD}/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  const res = await fetch(url, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
}

export default function AdminProducts() {
  const empty = { id: null, name: "", sku: "", description: "", category_id: "", featured: false, image_url: "" };
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [palette, setPalette] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  async function loadAll() {
    try {
      const [p, c] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setItems(p.data);
      setCats(c.data);

      try {
        const col = await api.get('/colors');
        setPalette(col.data || []);
      } catch {
        setPalette([]);
      }
    } catch (error) {
      showToast('Error al cargar datos', 'error');
    }
  }

  useEffect(() => { loadAll(); }, []);

  function resetForm() {
    setForm(empty);
    setSelectedColors([]);
    setErrors({});
  }

  function onPick(product) {
    setForm({
      id: product.id,
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      image_url: product.image_url || "",
      featured: !!product.featured,
      category_id: product.category_id || "",
    });
    const colorIds = (product.colors || []).map((c) => c.id);
    setSelectedColors(colorIds);
    setErrors({});
  }

  function validateForm() {
    const newErrors = {};
    if (!form.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function save() {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku || null,
        description: form.description || null,
        image_url: form.image_url || null,
        featured: !!form.featured,
        category_id: form.category_id || null,
        color_ids: selectedColors,
      };

      if (form.id) {
        await api.put(`/products/${form.id}`, payload);
        showToast('Producto actualizado exitosamente', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Producto creado exitosamente', 'success');
      }
      resetForm();
      loadAll();
    } catch (error) {
      showToast('Error al guardar el producto', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function del(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete('/products/' + id);
      if (form.id === id) resetForm();
      loadAll();
      showToast('Producto eliminado', 'success');
    } catch (error) {
      showToast('Error al eliminar el producto', 'error');
    }
  }

  async function handlePickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no debe superar 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, image_url: url }));
      showToast('Imagen subida exitosamente', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'No se pudo subir la imagen', 'error');
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function toggleColor(id) {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <section className="container mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="text-h2 font-bold text-primary">Productos</h1>
        <p className="text-body text-tertiary mt-1">
          Gestiona el catálogo de productos disponibles
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-glds-paper border-2 border-white/20 p-6 rounded-2xl">
          <h2 className="text-h4 font-bold text-primary mb-4">
            {form.id ? "Editar producto" : "Nuevo producto"}
          </h2>

          {/* Imagen / preview */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-secondary mb-2">
              Imagen del producto
            </label>
            {form.image_url ? (
              <div className="flex items-center gap-4">
                <img
                  src={form.image_url}
                  alt="Vista previa del producto"
                  className="w-24 h-24 rounded-xl object-cover border-2 border-white/20"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('cloudinary-file').click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Subiendo..." : "Cambiar imagen"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm({...form, image_url: ""})}
                  >
                    Eliminar imagen
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => document.getElementById('cloudinary-file').click()}
                disabled={uploading}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {uploading ? "Subiendo..." : "Subir imagen"}
              </Button>
            )}
            <input
              id="cloudinary-file"
              type="file"
              accept="image/*"
              onChange={handlePickImage}
              className="sr-only"
              aria-label="Seleccionar imagen del producto"
            />
            <p className="text-xs text-tertiary mt-2">
              Tamaño máximo: 5MB. Formatos: JPG, PNG, WebP
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Nombre del producto"
              placeholder="Ej: Camiseta polo personalizada"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              error={errors.name}
              required
            />

            <Input
              label="SKU"
              placeholder="Ej: CAM-001"
              value={form.sku}
              onChange={(e) => setForm({...form, sku: e.target.value})}
              helperText="Código único del producto"
            />

            <Textarea
              label="Descripción"
              placeholder="Describe las características del producto..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              rows={4}
            />

            <Select
              label="Categoría"
              value={form.category_id || ""}
              onChange={(e) => setForm({...form, category_id: e.target.value})}
            >
              <option value="">Sin categoría</option>
              {cats.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured-checkbox"
                checked={!!form.featured}
                onChange={(e) => setForm({...form, featured: e.target.checked})}
                className="w-4 h-4 rounded border-2 border-white/20 bg-glds-paper
                           text-glds-primary focus:ring-2 focus:ring-glds-primary focus:ring-offset-2 focus:ring-offset-glds-bg"
              />
              <label htmlFor="featured-checkbox" className="text-sm font-medium text-secondary cursor-pointer">
                <Star className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Producto destacado
              </label>
            </div>

            {/* Colores */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Colores disponibles
              </label>
              {palette.length === 0 ? (
                <p className="text-sm text-tertiary">
                  No hay colores definidos. Ve a Admin → Colores para agregar.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {palette.map(col => (
                    <label
                      key={col.id}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                        transition-all duration-normal
                        ${selectedColors.includes(col.id)
                          ? 'bg-glds-primary/20 border-2 border-glds-primary'
                          : 'bg-glds-paper border-2 border-white/20 hover:border-white/30'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(col.id)}
                        onChange={() => toggleColor(col.id)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{col.name}</span>
                      {col.hex && (
                        <span
                          className="w-5 h-5 rounded-full border-2 border-white/30"
                          style={{ background: col.hex }}
                          aria-label={`Color ${col.name}`}
                        />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={save}
                disabled={saving || !form.name.trim()}
                variant="primary"
              >
                {saving ? 'Guardando...' : (form.id ? 'Actualizar' : 'Guardar')}
              </Button>
              {form.id && (
                <>
                  <Button onClick={resetForm} variant="outline">
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => del(form.id)}
                    variant="danger"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Listado */}
        <div>
          <h2 className="text-h4 font-bold text-primary mb-4">
            Productos ({items.length})
          </h2>
          {items.length === 0 ? (
            <div className="bg-glds-paper border-2 border-white/20 rounded-2xl p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted" />
              <p className="text-secondary">No hay productos registrados</p>
              <p className="text-sm text-tertiary mt-1">Crea tu primer producto usando el formulario</p>
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {items.map(p => (
                <li
                  key={p.id}
                  className="bg-glds-paper border-2 border-white/20 rounded-xl p-4
                             hover:bg-glds-paperLight hover:border-white/30
                             transition-all duration-normal group"
                >
                  <div className="flex items-start gap-4">
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white/20"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-primary truncate">
                            {p.name}
                            {p.featured && (
                              <Star className="w-4 h-4 inline ml-2 text-glds-primary" aria-label="Destacado" />
                            )}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="secondary" size="sm">
                              SKU: {p.sku || '-'}
                            </Badge>
                            <Badge variant="secondary" size="sm">
                              {p.category_name || 'Sin categoría'}
                            </Badge>
                            {p.colors?.length > 0 && (
                              <Badge variant="info" size="sm">
                                {p.colors.length} color{p.colors.length !== 1 ? 'es' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => onPick(p)}
                            variant="ghost"
                            size="sm"
                            aria-label={`Editar ${p.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => del(p.id)}
                            variant="ghost"
                            size="sm"
                            aria-label={`Eliminar ${p.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-glds-error" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}