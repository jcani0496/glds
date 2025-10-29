import { useEffect, useState } from "react";
import { Palette, Plus, Edit3, Trash2, Save, X } from "lucide-react";
import api from "../lib/api";
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function AdminColors() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", hex: "" });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", hex: "" });
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  async function load() {
    try {
      const { data } = await api.get("/colors");
      setItems(data);
    } catch (error) {
      showToast('Error al cargar colores', 'error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function validateForm(formData) {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.hex?.trim()) {
      newErrors.hex = 'El código hexadecimal es requerido';
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(formData.hex)) {
      newErrors.hex = 'Formato inválido. Usa #RRGGBB (ej: #FF5733)';
    }
    return newErrors;
  }

  async function create(e) {
    e.preventDefault();
    const newErrors = validateForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await api.post("/colors", {
        name: form.name.trim(),
        hex: form.hex.trim().toUpperCase(),
      });
      setForm({ name: "", hex: "" });
      await load();
      showToast('Color creado exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear color', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    if (!confirm("¿Eliminar este color?")) return;
    try {
      await api.delete("/colors/" + id);
      await load();
      showToast('Color eliminado', 'success');
    } catch (error) {
      showToast('Error al eliminar color', 'error');
    }
  }

  function startEdit(color) {
    setEditId(color.id);
    setEditForm({ name: color.name, hex: color.hex });
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm({ name: "", hex: "" });
  }

  async function saveEdit() {
    if (!editId) return;
    const newErrors = validateForm(editForm);
    if (Object.keys(newErrors).length > 0) {
      showToast('Por favor corrige los errores', 'error');
      return;
    }

    try {
      await api.put(`/colors/${editId}`, {
        name: editForm.name.trim(),
        hex: editForm.hex.trim().toUpperCase(),
      });
      cancelEdit();
      await load();
      showToast('Color actualizado', 'success');
    } catch (error) {
      showToast('Error al actualizar color', 'error');
    }
  }

  return (
    <section className="container mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="text-h2 font-bold text-primary">Colores</h1>
        <p className="text-body text-tertiary mt-1">
          Gestiona la paleta de colores disponibles para los productos
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulario de creación */}
        <div className="bg-glds-paper border-2 border-white/20 p-6 rounded-2xl">
          <h2 className="text-h4 font-bold text-primary mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" aria-hidden="true" />
            Nuevo color
          </h2>
          <form onSubmit={create} className="space-y-4">
            <Input
              label="Nombre del color"
              placeholder="Ej: Rojo, Azul marino, Verde menta..."
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrors({ ...errors, name: "" });
              }}
              error={errors.name}
              required
            />
            <div>
              <Input
                label="Código hexadecimal"
                placeholder="#FF5733"
                value={form.hex}
                onChange={(e) => {
                  let value = e.target.value;
                  if (!value.startsWith('#')) value = '#' + value;
                  setForm({ ...form, hex: value });
                  setErrors({ ...errors, hex: "" });
                }}
                error={errors.hex}
                required
                maxLength={7}
              />
              <p className="text-xs text-tertiary mt-1">
                Formato: #RRGGBB (ej: #FF5733)
              </p>
              {form.hex && /^#[0-9A-Fa-f]{6}$/.test(form.hex) && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-secondary">Vista previa:</span>
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-white/30 shadow-md"
                    style={{ backgroundColor: form.hex }}
                    aria-label={`Vista previa del color ${form.hex}`}
                  />
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!form.name.trim() || !form.hex.trim() || loading}
              variant="primary"
            >
              {loading ? 'Creando...' : 'Añadir color'}
            </Button>
          </form>
        </div>

        {/* Listado */}
        <div>
          <h2 className="text-h4 font-bold text-primary mb-4">
            Colores ({items.length})
          </h2>
          {items.length === 0 ? (
            <div className="bg-glds-paper border-2 border-white/20 rounded-2xl p-8 text-center">
              <Palette className="w-12 h-12 mx-auto mb-3 text-muted" />
              <p className="text-secondary">No hay colores registrados</p>
              <p className="text-sm text-tertiary mt-1">
                Crea tu primer color para asignarlo a productos
              </p>
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {items.map((color) => {
                const editing = editId === color.id;
                return (
                  <li
                    key={color.id}
                    className="bg-glds-paper border-2 border-white/20 rounded-xl p-4
                               hover:bg-glds-paperLight hover:border-white/30
                               transition-all duration-normal"
                  >
                    {!editing ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-white/30 shadow-md flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                            aria-label={`Color ${color.name}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-primary truncate">
                              {color.name}
                            </p>
                            <p className="text-sm text-tertiary font-mono">
                              {color.hex}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => startEdit(color)}
                            variant="ghost"
                            size="sm"
                            aria-label={`Editar ${color.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => del(color.id)}
                            variant="ghost"
                            size="sm"
                            aria-label={`Eliminar ${color.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-glds-error" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-white/30 shadow-md flex-shrink-0"
                            style={{ backgroundColor: editForm.hex }}
                          />
                          <div className="flex-1 grid gap-2">
                            <Input
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({ ...editForm, name: e.target.value })
                              }
                              placeholder="Nombre del color"
                              autoFocus
                            />
                            <Input
                              value={editForm.hex}
                              onChange={(e) => {
                                let value = e.target.value;
                                if (!value.startsWith('#')) value = '#' + value;
                                setEditForm({ ...editForm, hex: value });
                              }}
                              placeholder="#FF5733"
                              maxLength={7}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={cancelEdit} variant="outline" size="sm">
                            <X className="w-4 h-4" />
                            Cancelar
                          </Button>
                          <Button
                            onClick={saveEdit}
                            variant="primary"
                            size="sm"
                            disabled={!editForm.name.trim() || !editForm.hex.trim()}
                          >
                            <Save className="w-4 h-4" />
                            Guardar
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
