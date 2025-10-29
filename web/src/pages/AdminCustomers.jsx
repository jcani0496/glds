import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, Phone, Mail, Building, MapPin, Tag, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/hooks/use-toast";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    country: "",
    notes: "",
    tags: "",
    status: "active",
  });

  useEffect(() => {
    loadCustomers();
  }, [page, search, status]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/customers", {
        params: { page, search, status, limit: 20 },
      });
      setCustomers(data.customers);
      setTotal(data.total);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetail = async (id) => {
    try {
      const { data } = await api.get(`/customers/${id}`);
      setSelectedCustomer(data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading customer detail:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el detalle del cliente",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/customers/${formData.id}`, formData);
        toast({ title: "Cliente actualizado correctamente" });
      } else {
        await api.post("/customers", formData);
        toast({ title: "Cliente creado correctamente" });
      }
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        city: "",
        country: "",
        notes: "",
        tags: "",
        status: "active",
      });
      loadCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo guardar el cliente",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      await api.delete(`/customers/${id}`);
      toast({ title: "Cliente eliminado correctamente" });
      loadCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setShowModal(true);
  };

  const addInteraction = async (customerId, interaction) => {
    try {
      await api.post(`/customers/${customerId}/interactions`, interaction);
      toast({ title: "Interacción registrada correctamente" });
      loadCustomerDetail(customerId);
    } catch (error) {
      console.error("Error adding interaction:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la interacción",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">CRM - Clientes</h1>
        <button
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              phone: "",
              company: "",
              address: "",
              city: "",
              country: "",
              notes: "",
              tags: "",
              status: "active",
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-glds-primary text-zinc-900 font-semibold hover:shadow-glow transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo cliente
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o empresa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="lead">Lead</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glds-primary mx-auto mb-4"></div>
          <p>Cargando clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 text-white/60">
          No se encontraron clientes
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/[.05] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Contacto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Empresa</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Cotizaciones</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {customer.tags.split(",").map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-white/80">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-white/80">
                              <Phone className="w-4 h-4" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80">
                        {customer.company || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            customer.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : customer.status === "lead"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {customer.status === "active"
                            ? "Activo"
                            : customer.status === "lead"
                            ? "Lead"
                            : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80">
                        {customer.total_quotes || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => loadCustomerDetail(customer.id)}
                            className="p-2 rounded-lg hover:bg-white/10 transition"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-2 rounded-lg hover:bg-white/10 transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-white/60">
              Mostrando {customers.length} de {total} clientes
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={customers.length < 20}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-50 hover:bg-white/10 transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold">
                {formData.id ? "Editar cliente" : "Nuevo cliente"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags (separados por coma)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="vip, mayorista, etc."
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-glds-primary text-zinc-900 font-semibold hover:shadow-glow transition"
                >
                  {formData.id ? "Actualizar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información de contacto</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-glds-primary" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-glds-primary" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-glds-primary" />
                        <span>{selectedCustomer.company}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-glds-primary" />
                        <span>
                          {selectedCustomer.address}
                          {selectedCustomer.city && `, ${selectedCustomer.city}`}
                          {selectedCustomer.country && `, ${selectedCustomer.country}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Estadísticas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-white/5 p-4">
                      <p className="text-sm text-white/60">Cotizaciones</p>
                      <p className="text-2xl font-bold">{selectedCustomer.total_quotes || 0}</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-4">
                      <p className="text-sm text-white/60">Estado</p>
                      <p className="text-lg font-semibold capitalize">{selectedCustomer.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCustomer.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notas</h3>
                  <p className="text-sm text-white/80 whitespace-pre-line">
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4">Cotizaciones recientes</h3>
                {selectedCustomer.quotes && selectedCustomer.quotes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.quotes.slice(0, 5).map((quote) => (
                      <div
                        key={quote.id}
                        className="rounded-lg bg-white/5 p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{quote.code}</p>
                          <p className="text-sm text-white/60">
                            {new Date(quote.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            quote.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : quote.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {quote.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">No hay cotizaciones registradas</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Interacciones</h3>
                {selectedCustomer.interactions && selectedCustomer.interactions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCustomer.interactions.map((interaction) => (
                      <div
                        key={interaction.id}
                        className="rounded-lg bg-white/5 p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-glds-primary" />
                            <span className="font-medium capitalize">{interaction.type}</span>
                          </div>
                          <span className="text-xs text-white/60">
                            {new Date(interaction.created_at).toLocaleString()}
                          </span>
                        </div>
                        {interaction.subject && (
                          <p className="text-sm font-medium mb-1">{interaction.subject}</p>
                        )}
                        {interaction.notes && (
                          <p className="text-sm text-white/80">{interaction.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">No hay interacciones registradas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
