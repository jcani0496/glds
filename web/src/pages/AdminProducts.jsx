import { useEffect, useState } from 'react';
import api from '../lib/api';

/* Cloudinary (frontend .env)
   VITE_CLOUDINARY_CLOUD=tu_cloud
   VITE_CLOUDINARY_UPLOAD_PRESET=tu_preset
*/
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file) {
  if (!CLOUD || !PRESET) {
    alert("Configura VITE_CLOUDINARY_CLOUD y VITE_CLOUDINARY_UPLOAD_PRESET en el .env del frontend.");
    throw new Error("Cloudinary not configured");
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
  const [palette, setPalette] = useState([]);           // colores disponibles (desde /colors)
  const [selectedColors, setSelectedColors] = useState([]); // ids seleccionados para el producto
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    const [p, c] = await Promise.all([
      api.get('/products'),
      api.get('/categories'),
    ]);
    setItems(p.data);
    setCats(c.data);

    // Lista de colores (admin)
    try {
      const col = await api.get('/colors');
      setPalette(col.data || []);
    } catch {
      setPalette([]); // por si aún no montaste /colors
    }
  }

  useEffect(() => { loadAll(); }, []);

  function resetForm() {
    setForm(empty);
    setSelectedColors([]);
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
  }

  async function save() {
    if (!form.name?.trim()) return;
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
      } else {
        await api.post('/products', payload);
      }
      resetForm();
      loadAll();
    } finally {
      setSaving(false);
    }
  }

  async function del(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    await api.delete('/products/' + id);
    if (form.id === id) resetForm();
    loadAll();
  }

  async function handlePickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      console.error(err);
      alert('No se pudo subir la imagen');
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
      <h3 className="text-2xl font-semibold mb-4">Productos</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulario (manteniendo tu estilo y Cloudinary) */}
        <div className="bg-white/5 p-4 rounded-xl">
          <h4 className="font-bold mb-2">{form.id ? "Editar producto" : "Nuevo producto"}</h4>

          {/* Imagen / preview */}
          <div className="mb-3">
            {form.image_url ? (
              <div className="flex items-center gap-3">
                <img src={form.image_url} alt="" className="w-20 h-20 rounded-lg object-cover border border-white/10" />
                <button
                  className="rounded-full px-4 py-2 bg-glds-primary text-zinc-900 font-semibold hover:shadow-glow"
                  onClick={() => document.getElementById('cloudinary-file').click()}
                  disabled={uploading}
                >
                  {uploading ? "Subiendo..." : "Cambiar imagen"}
                </button>
              </div>
            ) : (
              <button
                className="rounded-full px-4 py-2 bg-glds-primary text-zinc-900 font-semibold hover:shadow-glow"
                onClick={() => document.getElementById('cloudinary-file').click()}
                disabled={uploading}
              >
                {uploading ? "Subiendo..." : "Subir imagen"}
              </button>
            )}
            <input id="cloudinary-file" type="file" accept="image/*" onChange={handlePickImage} className="hidden" />
          </div>

          <div className="grid gap-2">
            <input className="bg-white/10 rounded px-3 py-2" placeholder="Nombre"
                   value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            <input className="bg-white/10 rounded px-3 py-2" placeholder="SKU"
                   value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/>
            <textarea className="bg-white/10 rounded px-3 py-2" rows="3" placeholder="Descripción"
                      value={form.description} onChange={e=>setForm({...form,description:e.target.value})}></textarea>

            {/* URL de imagen: oculto, pero mantenido por compatibilidad */}
            <input type="hidden" value={form.image_url || ""} readOnly />

            <select className="bg-white/10 rounded px-3 py-2"
                    value={form.category_id || ""} onChange={e=>setForm({...form,category_id:e.target.value})}>
              <option value="">Sin categoría</option>
              {cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label className="text-sm opacity-80 inline-flex items-center gap-2">
              <input type="checkbox" checked={!!form.featured}
                     onChange={e=>setForm({...form, featured:e.target.checked})}/>
              Destacado
            </label>

            {/* Colores asignables */}
            <div className="mt-2">
              <div className="text-sm font-semibold mb-1">Colores disponibles</div>
              {palette.length === 0 ? (
                <div className="text-xs opacity-60">No hay colores definidos (Admin → /colors)</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {palette.map(col => (
                    <label key={col.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(col.id)}
                        onChange={() => toggleColor(col.id)}
                      />
                      <span className="text-sm">{col.name}</span>
                      {col.hex ? <span className="inline-block w-4 h-4 rounded" style={{ background: col.hex }} /> : null}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={save}
                      disabled={saving || !form.name.trim()}
                      className="bg-glds-primary text-black rounded px-3 py-2 font-semibold disabled:opacity-50">
                {form.id ? "Actualizar" : "Guardar"}
              </button>
              {form.id && (
                <>
                  <button onClick={resetForm} className="rounded px-3 py-2 bg-white/10 border border-white/10">Cancelar</button>
                  <button onClick={()=>del(form.id)} className="text-red-300 text-sm px-3 py-2 border border-red-400/30 rounded">
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Listado */}
        <div>
          <ul className="space-y-2">
            {items.map(p=> (
              <li key={p.id}
                  className="bg-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-white/60 truncate">
                    SKU {p.sku||'-'} · {p.category_name||'Sin categoría'} {p.featured? '· ⭐':''}
                    {(p.colors?.length ? ` · ${p.colors.length} color(es)` : '')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={()=>onPick(p)} className="text-sm underline underline-offset-4">Editar</button>
                  <button onClick={()=>del(p.id)} className="text-red-300 text-sm">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}