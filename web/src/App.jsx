import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import AnimatedBackground from "./components/AnimatedBackground.jsx";
import { ToastProvider } from "./components/ui/Toast";
import Dock from "./components/Dock.jsx";
import QuoteCartModal from "./components/QuoteCartModal.jsx";
import { CartProvider } from "./lib/store.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Catalog from "./pages/Catalog.jsx";
import Thanks from "./pages/Thanks.jsx";
import TrackQuote from "./pages/TrackQuote.jsx";
import ResumeQuote from "./pages/ResumeQuote.jsx";
import ProductCompare from "./pages/ProductCompare.jsx";
import Clients from "./pages/Clients.jsx";

import AdminLogin from "./pages/AdminLogin.jsx";
import Admin from "./pages/Admin.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminCategories from "./pages/AdminCategories.jsx";
import AdminColors from "./pages/AdminColors.jsx";
import AdminQuotes from "./pages/AdminQuotes.jsx";
import AdminCustomers from "./pages/AdminCustomers.jsx";
import AdminReports from "./pages/AdminReports.jsx";
import AdminDock from "@/components/AdminDock.jsx";

function Protected({ children }) {
  const token = localStorage.getItem("glds_admin_token");
  if (!token) {
    window.location.href = "/admin/login";
    return null;
  }
  return children;
}

function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <a href="#main" className="skip-link">
        Saltar al contenido
      </a>

      <AnimatedBackground opacity={0.25} speed={0.1} count={5} />

      <header className="z-50">
        {isAdmin ? <AdminDock /> : <Dock />}
      </header>

      <div aria-hidden className="h-20 sm:h-24" />

      <main id="main" className="relative">
        <Suspense
          fallback={
            <div className="container mx-auto px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-glds-primary border-r-transparent" role="status">
                <span className="sr-only">Cargando...</span>
              </div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      {!isAdmin && <QuoteCartModal />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/compare" element={<ProductCompare />} />
              <Route path="/thanks" element={<Thanks />} />
              <Route path="/track/:token" element={<TrackQuote />} />
              <Route path="/resume/:token" element={<ResumeQuote />} />
              <Route path="/cart" element={<Home />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <Protected>
                  <Layout />
                </Protected>
              }
            >
              <Route index element={<Admin />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="colors" element={<AdminColors />} />
              <Route path="quotes" element={<AdminQuotes />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Routes>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}