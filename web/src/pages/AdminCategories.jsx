import { useEffect, useState } from "react";
import { Edit3, Trash2, Save, X, FolderPlus, Folder } from "lucide-react";
import api from "../lib/api";
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  async function load() {
    try {
      const { data } = await api.get("/categories");
      setItems(data);
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/categories", { name: name.trim() });
      setName("");
      await load();
      toast.success('Categoría creada exitosamente');
    } catch (error) {
      toast.error('Error al crear categoría');
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await api.delete("/categories/" + id);
      await load();
      toast.success('Categoría eliminada');
    } catch (error) {
      toast.error('Error al eliminar categoría');
    }
  }

  function startEdit(c) {
    setEditId(c.id);
    setEditName(c.name);
  }

  function cancelEdit() {
    setEditId(null);
    setEditName("");
  }

  async function saveEdit() {
    if (!editId || !editName.trim()) return;
    try {
      await api.put(`/categories/${editId}`, { name: editName.trim() });
      cancelEdit();
      await load();
      toast.success('Categoría actualizada');
    } catch (error) {
      toast.error('Error al actualizar categoría');
    }
  }

  return (
    <section className="container mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="text-h2 font-bold text-primary">Categorías</h1>
        <p className="text-body text-tertiary mt-1">
          Organiza tus productos en categorías
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulario de creación */}
        <div className="bg-glds-paper border-2 border-white/20 p-6 rounded-2xl">
          <h2 className="text-h4 font-bold text-primary mb-4 flex items-center gap-2">
            <FolderPlus className="w-5 h-5" aria-hidden="true" />
            Nueva categoría
          </h2>
          <form onSubmit={create} className="space-y-4">
            <Input
              label="Nombre de la categoría"
              placeholder="Ej: Textiles, Tecnología, Oficina..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              error={error}
              required
            />
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              variant="primary"
            >
              {loading ? 'Creando...' : 'Añadir categoría'}
            </Button>
          </form>
        </div>

        {/* Listado */}
        <div>
          <h2 className="text-h4 font-bold text-primary mb-4">
            Categorías ({items.length})
          </h2>
          {items.length === 0 ? (
            <div className="bg-glds-paper border-2 border-white/20 rounded-2xl p-8 text-center">
              <Folder className="w-12 h-12 mx-auto mb-3 text-muted" />
              <p className="text-secondary">No hay categorías registradas</p>
              <p className="text-sm text-tertiary mt-1">Crea tu primera categoría para organizar productos</p>
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {items.map((c) => {
                const editing = editId === c.id;
                return (
                  <li
                    key={c.id}
                    className="bg-glds-paper border-2 border-white/20 rounded-xl p-4
                               hover:bg-glds-paperLight hover:border-white/30
                               transition-all duration-normal"
                  >
                    {!editing ? (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Folder className="w-5 h-5 text-glds-primary flex-shrink-0" aria-hidden="true" />
                          <span className="font-medium text-primary truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => startEdit(c)}
                            variant="ghost"
                            size="sm"
                            aria-label={`Editar ${c.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => del(c.id)}
                            variant="ghost"
                            size="sm"
                            aria-label={`Eliminar ${c.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-glds-error" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nombre de la categoría"
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          onClick={cancelEdit}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={saveEdit}
                          variant="primary"
                          size="sm"
                          disabled={!editName.trim()}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
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