import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { toast } from "@/components/hooks/use-toast";
import api from "@/lib/api";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre, email y mensaje.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      await api.post("/contact", form);
      toast({
        title: "Mensaje enviado",
        description: "Nos pondremos en contacto contigo pronto.",
      });
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const faqs = [
    {
      q: "¿Cuál es el tiempo de entrega?",
      a: "El tiempo de entrega varía según el producto y la cantidad. Generalmente entre 7-15 días hábiles.",
    },
    {
      q: "¿Hacen envíos a toda Guatemala?",
      a: "Sí, realizamos envíos a todo el país. Los costos varían según la ubicación.",
    },
    {
      q: "¿Puedo personalizar los productos con mi logo?",
      a: "¡Por supuesto! Ofrecemos varios métodos de marcaje: serigrafía, bordado, grabado láser y más.",
    },
    {
      q: "¿Cuál es el pedido mínimo?",
      a: "El pedido mínimo varía por producto. Contáctanos para conocer los detalles específicos.",
    },
    {
      q: "¿Ofrecen muestras antes de hacer el pedido completo?",
      a: "Sí, podemos proporcionar muestras físicas o digitales según el caso.",
    },
  ];

  return (
    <section className="container mx-auto max-w-6xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3">Contáctanos</h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          ¿Tienes un proyecto en mente? Estamos aquí para ayudarte a crear el merchandising perfecto para tu marca.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[.05] p-6">
            <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                    placeholder="1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Empresa</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60"
                    placeholder="Tu empresa"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mensaje <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows="5"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[.06] border border-white/10 outline-none focus:ring-2 focus:ring-glds-primary/60 resize-none"
                  placeholder="Cuéntanos sobre tu proyecto..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-glds-primary px-6 py-3 text-base font-semibold text-zinc-900 hover:shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar mensaje
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[.05] p-6">
            <h3 className="text-xl font-bold mb-4">Información de contacto</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-glds-primary mt-0.5" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <a href="tel:35964698" className="text-white/80 hover:text-glds-primary transition">
                    PBX: 3596-4698
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-glds-primary mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:ventas@glds.com" className="text-white/80 hover:text-glds-primary transition">
                    ventas@glds.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-glds-primary mt-0.5" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <a
                    href="https://wa.me/50235964698"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-glds-primary transition"
                  >
                    +502 3596-4698
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-glds-primary mt-0.5" />
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-white/80">Ciudad de Guatemala, Guatemala</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-glds-primary mt-0.5" />
                <div>
                  <p className="font-medium">Horario de atención</p>
                  <p className="text-white/80">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                  <p className="text-white/80">Sábados: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[.05] p-6">
            <h3 className="text-xl font-bold mb-4">Ubicación</h3>
            <div className="aspect-video rounded-xl overflow-hidden bg-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247117.66436818705!2d-90.73049484999999!3d14.628434399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8589a3c7cc6f7703%3A0x7c2f9b8b4e6c8c8c!2sCiudad%20de%20Guatemala!5e0!3m2!1ses!2sgt!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación GLDS"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.05] p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Preguntas frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="font-semibold text-glds-primary">{faq.q}</h3>
              <p className="text-sm text-white/80">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
