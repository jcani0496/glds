import { useMemo } from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    id: "grupo-norte",
    company: "Grupo Norte",
    quote:
      "Transformaron nuestros eventos corporativos con kits premium. Nuestros clientes nos recuerdan por el detalle.",
    name: "Mariana Torres",
    role: "Coordinadora de Marketing",
  },
  {
    id: "teknoplus",
    company: "TeknoPlus",
    quote:
      "El equipo de GLDS entiende los tiempos del retail. Entregaron todo personalizado y listo para usar.",
    name: "Rodrigo Pérez",
    role: "Director Comercial",
  },
  {
    id: "banco-aurora",
    company: "Banco Aurora",
    quote:
      "Necesité una activación en 72 horas. GLDS respondió con catálogo curado y envió la cotización inmediata.",
    name: "Valeria Espinosa",
    role: "Brand Manager",
  },
];

export default function HomeTestimonials() {
  const testimonials = useMemo(() => TESTIMONIALS, []);

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-glds-primary/90">
          <Star className="h-4 w-4" /> Respaldado por marcas de impacto
        </p>
        <h2 className="mt-2 text-3xl font-extrabold">Historias que impulsan la confianza</h2>
        <p className="mt-3 text-sm opacity-80">
          Las empresas que confían en GLDS elevan su presencia con merch que genera conexiones memorables.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={item.id}
            className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-6"
          >
            <div className="text-sm leading-relaxed opacity-90">
              &ldquo;{item.quote}&rdquo;
            </div>
            <div className="mt-auto text-xs uppercase tracking-wide opacity-70">{item.company}</div>
            <div className="text-sm font-semibold">{item.name}</div>
            <div className="text-xs opacity-60">{item.role}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
