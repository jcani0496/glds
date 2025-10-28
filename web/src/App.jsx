// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import AnimatedBackground from "./components/AnimatedBackground.jsx";
import { Toaster } from "./components/ui/toaster"; // shadcn
import Dock from "./components/Dock.jsx";           // tu dock actual (landing)
import QuoteCartModal from "./components/QuoteCartModal.jsx";
import { CartProvider } from "./lib/store.jsx";

// Páginas (ajusta imports a tus rutas reales si difieren)
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Catalog from "./pages/Catalog.jsx";
import Thanks from "./pages/Thanks.jsx";

// Admin (ajusta si tus nombres/rutas difieren)
import AdminLogin from "./pages/AdminLogin.jsx";
import Admin from "./pages/Admin.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminCategories from "./pages/AdminCategories.jsx";
import AdminQuotes from "./pages/AdminQuotes.jsx";
import AdminDock from "@/components/AdminDock.jsx";

/* --------- Protected route (admin) --------- */
function Protected({ children }) {
  const token = localStorage.getItem("glds_admin_token");
  if (!token) {
    window.location.href = "/admin/login";
    return null;
  }
  return children;
}

/* --------- Layout principal --------- */
function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black/60 text-white px-3 py-2 rounded">
        Saltar al contenido
      </a>

      <AnimatedBackground opacity={0.25} speed={0.1} count={5} />

      {/* Dock */}
      <header className="z-50">
        {isAdmin ? <AdminDock /> : <Dock />}
      </header>

      {/* 👉 Espaciador para que el contenido no quede debajo del dock */}
      <div aria-hidden className="h-20 sm:h-24" />

      <main id="main" className="relative">
        <Suspense fallback={<div className="container mx-auto px-6 py-12">Cargando…</div>}>
          <Outlet />
        </Suspense>
      </main>

      {/* El modal de carrito solo en el sitio público */}
      {!isAdmin && <QuoteCartModal />}

      <Toaster />
    </>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Público */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/thanks" element={<Thanks />} />
            {/* /cart es manejado por QuoteCartModal montado en Layout */}
            <Route path="/cart" element={<Home />} />
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <Protected>
                {/* En admin suele haber su propio layout; aquí heredamos AnimatedBackground y omitimos Dock */}
                <Layout />
              </Protected>
            }
          >
            <Route index element={<Admin />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="quotes" element={<AdminQuotes />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Layout />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
  return <Layout />;
}