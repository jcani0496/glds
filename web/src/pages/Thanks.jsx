// web/src/pages/Thanks.jsx
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function Thanks() {
  const { search } = useLocation();
  const code = useMemo(() => new URLSearchParams(search).get("code"), [search]);

  return (
    <section className="container mx-auto px-6 py-20 text-center">
      <div className="mx-auto max-w-xl bg-white/[.06] border border-white/10 rounded-2xl p-10">
        <CheckCircle2 className="w-14 h-14 mx-auto text-glds-primary mb-4" />
        <h1 className="text-3xl font-extrabold mb-2">¡Gracias por tu solicitud!</h1>
        <p className="text-white/80 mb-4">
          Hemos recibido tu cotización y te enviamos un PDF al correo proporcionado.
        </p>
        {code && (
          <p className="text-sm text-white/70 mb-6">
            Código de cotización: <span className="font-mono">{code}</span>
          </p>
        )}
        <div className="flex justify-center gap-3">
          <Link to="/catalog" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15">
            Seguir explorando
          </Link>
          <Link to="/" className="px-4 py-2 rounded-full bg-glds-primary text-zinc-900 font-semibold">
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}