// web/src/pages/AdminLogin.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api.js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/admin";

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password: pass });
      if (!data?.token) throw new Error("No token");
      localStorage.setItem("glds_admin_token", data.token);
      nav(from, { replace: true });
    } catch (err) {
      alert("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-[70vh] grid place-items-center">
      <form onSubmit={onSubmit} className="w-[min(420px,92vw)] p-6 rounded-2xl bg-white/[.06] border border-white/10">
        <h1 className="text-2xl font-extrabold mb-4">Ingreso Admin</h1>
        <input
          className="w-full px-3 py-2 mb-3 rounded-lg bg-white/[.06] border border-white/10"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full px-3 py-2 mb-4 rounded-lg bg-white/[.06] border border-white/10"
          placeholder="Contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button
          disabled={loading}
          className={`w-full rounded-full px-4 py-3 font-semibold transition ${
            loading ? "bg-white/10 cursor-not-allowed" : "bg-glds-primary text-zinc-900 hover:shadow-glow"
          }`}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}