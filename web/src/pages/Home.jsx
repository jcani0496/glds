import { Link } from "react-router-dom";
import AnimatedLogo from "../components/AnimatedLogo.jsx";
import InteractiveHoverButton from "../components/InteractiveHoverButton.jsx";

export default function Home() {
  return (
    <section className="min-h-[70vh] grid place-items-center text-center">
      <div className="max-w-2xl px-6">
        <div className="mb-6">
          <AnimatedLogo width={180} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Materiales promocionales que elevan tu marca
        </h1>
        <p className="mt-4 text-white">
          Catálogo sin precios. Arma tu cotización en minutos y recibe el PDF
          por correo.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <InteractiveHoverButton to="/catalog" variant="primary">
            Ver Catálogo
          </InteractiveHoverButton>
          <InteractiveHoverButton to="/featured" variant="outline">
            Productos Destacados
          </InteractiveHoverButton>
        </div>
      </div>
    </section>
  );
}
