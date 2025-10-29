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
    <div className="space-y-section pb-20">
      <section className="min-h-[70vh] grid place-items-center text-center px-6">
        <div className="max-w-3xl">
          <div className="mb-6 flex justify-center motion-safe:animate-fade-in">
            <AnimatedLogo width={180} />
          </div>
          <p className="inline-flex items-center justify-center gap-2 rounded-full
                        border-2 border-glds-primary/30 bg-glds-primary/10
                        px-4 py-1.5 text-xs font-bold uppercase tracking-wide
                        text-glds-primaryLight
                        motion-safe:animate-slide-up motion-safe:animation-delay-100">
            Merch que deja huella
          </p>
          <h1 className="mt-6 text-h1 md:text-display font-extrabold tracking-tight text-primary
                         motion-safe:animate-slide-up motion-safe:animation-delay-200">
            Materiales promocionales que elevan tu marca
          </h1>
          <p className="mt-6 text-body-lg text-secondary leading-relaxed
                        motion-safe:animate-slide-up motion-safe:animation-delay-300">
            Diseñamos, producimos y entregamos merchandising memorable para tus clientes y colaboradores.
            Arma tu cotización en minutos y recibe el PDF directo en tu correo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row
                          motion-safe:animate-slide-up motion-safe:animation-delay-400">
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
          {features.map(({ id, title, description, icon: Icon }, index) => (
            <article
              key={id}
              className="rounded-2xl border-2 border-white/20 bg-glds-paper p-6 text-left
                         hover:bg-glds-paperLight hover:border-white/30 hover:shadow-card-hover
                         transition-all duration-normal group
                         motion-safe:animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center rounded-xl
                              bg-glds-primary/20 p-3 text-glds-primary
                              group-hover:bg-glds-primary/30 group-hover:shadow-glow
                              transition-all duration-normal">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-h4 font-semibold text-primary">{title}</h3>
              <p className="mt-2 text-body-sm text-tertiary leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <HomeCatalogPreview />

      <HomeTestimonials />

      <section className="container mx-auto px-6">
        <div className="rounded-3xl border-2 border-white/20 bg-glds-paper p-8 text-center sm:p-12
                        shadow-card hover:shadow-card-hover hover:border-white/30
                        transition-all duration-normal">
          <h2 className="text-h2 md:text-h1 font-extrabold text-primary">
            ¿Listo para impulsar tu próximo lanzamiento?
          </h2>
          <p className="mt-4 text-body text-tertiary max-w-2xl mx-auto leading-relaxed">
            Coordina una sesión con nuestro equipo para diseñar el kit perfecto y agendar entregas a tiempo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <InteractiveHoverButton to="/contact" variant="primary">
              Solicitar asesoría personalizada
            </InteractiveHoverButton>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-xl
                         border-2 border-white/20 bg-glds-paper hover:bg-glds-paperLight
                         px-6 py-3 text-sm font-semibold text-secondary hover:text-primary
                         transition-all duration-normal
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-glds-primary
                         focus-visible:ring-offset-2 focus-visible:ring-offset-glds-bg
                         active:scale-95"
            >
              Conoce cómo trabajamos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
