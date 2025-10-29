import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Package, Clock } from "lucide-react";
import AnimatedLogo from "../components/AnimatedLogo.jsx";
import InteractiveHoverButton from "../components/InteractiveHoverButton.jsx";
import HomeCatalogPreview from "../components/HomeCatalogPreview.jsx";
import HomeTestimonials from "../components/HomeTestimonials.jsx";

const FEATURE_ITEMS = [
  {
    id: "personalizacion",
    title: "Catálogo curado",
    description: "Categorías ordenadas y fichas claras para cotizar sin fricción.",
    icon: Sparkles,
  },
  {
    id: "kits",
    title: "Kits listos para entregar",
    description: "Selecciona combinaciones que destacan en eventos y activaciones.",
    icon: Package,
  },
  {
    id: "rapidez",
    title: "Cotización inmediata",
    description: "Arma tu listado, recibe PDF y seguimiento en minutos.",
    icon: Clock,
  },
];

export default function Home() {
  const features = useMemo(() => FEATURE_ITEMS, []);

  return (
    <div className="space-y-16 pb-20">
      <section className="min-h-[70vh] grid place-items-center text-center px-6">
        <div className="max-w-3xl">
          <div className="mb-6 flex justify-center">
            <AnimatedLogo width={180} />
          </div>
          <p className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-glds-primary/90">
            Merch que deja huella
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Materiales promocionales que elevan tu marca
          </h1>
          <p className="mt-4 text-white/80">
            Diseñamos, producimos y entregamos merchandising memorable para tus clientes y colaboradores. Arma tu cotización en minutos y recibe el PDF directo en tu correo.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <InteractiveHoverButton to="/catalog" variant="primary">
              Ver catálogo completo
            </InteractiveHoverButton>
            <InteractiveHoverButton to="/contact" variant="outline">
              Hablar con un asesor
            </InteractiveHoverButton>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map(({ id, title, description, icon: Icon }) => (
            <article
              key={id}
              className="rounded-2xl border border-white/10 bg-white/[.05] p-5 text-left"
            >
              <div className="inline-flex items-center justify-center rounded-full bg-white/[.08] p-3 text-glds-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm opacity-80">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <HomeCatalogPreview />

      <HomeTestimonials />

      <section className="container mx-auto px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[.05] p-8 text-center sm:p-12">
          <h2 className="text-3xl font-extrabold">¿Listo para impulsar tu próximo lanzamiento?</h2>
          <p className="mt-3 text-sm opacity-80">
            Coordina una sesión con nuestro equipo para diseñar el kit perfecto y agendar entregas a tiempo.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <InteractiveHoverButton to="/contact" variant="primary">
              Solicitar asesoría personalizada
            </InteractiveHoverButton>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-sm font-semibold transition hover:bg-white/[.1]"
            >
              Conoce cómo trabajamos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
