import { Building2, Users, GraduationCap, Star, Award, TrendingUp, Quote } from "lucide-react";

export default function Clients() {
  const industries = [
    {
      name: "Tecnología",
      clients: [
        { name: "TechCorp GT", logo: "🖥️", testimonial: "Excelente calidad y servicio" },
        { name: "Digital Solutions", logo: "💻", testimonial: "Siempre cumplen con los tiempos" },
        { name: "InnovateTech", logo: "🚀", testimonial: "Los mejores en merchandising" },
        { name: "CloudSystems", logo: "☁️", testimonial: "Productos de alta calidad" },
      ],
    },
    {
      name: "Salud",
      clients: [
        { name: "Hospital Central", logo: "🏥", testimonial: "Profesionales y confiables" },
        { name: "Clínica Médica", logo: "⚕️", testimonial: "Excelente atención al cliente" },
        { name: "FarmaSalud", logo: "💊", testimonial: "Productos personalizados perfectos" },
        { name: "LabDiagnostics", logo: "🔬", testimonial: "Muy recomendados" },
      ],
    },
    {
      name: "Educación",
      clients: [
        { name: "Universidad Nacional", logo: "🎓", testimonial: "Calidad excepcional" },
        { name: "Colegio Internacional", logo: "📚", testimonial: "Siempre innovadores" },
        { name: "Instituto Técnico", logo: "🏫", testimonial: "Excelente relación calidad-precio" },
        { name: "Academia de Idiomas", logo: "🌍", testimonial: "Muy profesionales" },
      ],
    },
    {
      name: "Finanzas",
      clients: [
        { name: "Banco Nacional", logo: "🏦", testimonial: "Confiables y puntuales" },
        { name: "Inversiones GT", logo: "💰", testimonial: "Productos premium" },
        { name: "Seguros Unidos", logo: "🛡️", testimonial: "Excelente servicio" },
        { name: "FinTech Solutions", logo: "💳", testimonial: "Muy recomendados" },
      ],
    },
    {
      name: "Retail",
      clients: [
        { name: "SuperMercado Central", logo: "🛒", testimonial: "Gran variedad de productos" },
        { name: "Fashion Store", logo: "👔", testimonial: "Diseños únicos" },
        { name: "ElectroHogar", logo: "🔌", testimonial: "Calidad garantizada" },
        { name: "Deportes Pro", logo: "⚽", testimonial: "Los mejores del mercado" },
      ],
    },
    {
      name: "Alimentos y Bebidas",
      clients: [
        { name: "Restaurante Gourmet", logo: "🍽️", testimonial: "Productos elegantes" },
        { name: "Café Premium", logo: "☕", testimonial: "Excelente presentación" },
        { name: "Panadería Artesanal", logo: "🥖", testimonial: "Muy creativos" },
        { name: "Bebidas Naturales", logo: "🥤", testimonial: "Siempre innovando" },
      ],
    },
  ];

  const featuredTestimonials = [
    {
      name: "María González",
      company: "TechCorp GT",
      role: "Gerente de Marketing",
      testimonial: "GLDS transformó completamente nuestra imagen corporativa. Los productos son de excelente calidad y el servicio al cliente es excepcional. Definitivamente nuestro socio estratégico para merchandising.",
      rating: 5,
    },
    {
      name: "Carlos Ramírez",
      company: "Hospital Central",
      role: "Director de Comunicaciones",
      testimonial: "Trabajar con GLDS ha sido una experiencia increíble. Siempre cumplen con los tiempos de entrega y la calidad de los productos supera nuestras expectativas. Los recomendamos ampliamente.",
      rating: 5,
    },
    {
      name: "Ana Martínez",
      company: "Universidad Nacional",
      role: "Coordinadora de Eventos",
      testimonial: "Hemos trabajado con GLDS en múltiples eventos y siempre nos sorprenden con su creatividad y profesionalismo. Los productos personalizados son perfectos y nuestros estudiantes los aman.",
      rating: 5,
    },
  ];

  const caseStudies = [
    {
      title: "Evento Corporativo - TechCorp GT",
      description: "Suministro completo de merchandising para evento de 500 personas",
      products: "Camisetas, gorras, mochilas, termos personalizados",
      result: "100% de satisfacción, entrega a tiempo, productos de alta calidad",
      icon: <Building2 className="w-8 h-8" />,
    },
    {
      title: "Campaña de Salud - Hospital Central",
      description: "Kit de bienvenida para 200 nuevos empleados",
      products: "Uniformes, identificaciones, bolsas, libretas",
      result: "Mejora en la imagen institucional y sentido de pertenencia",
      icon: <Users className="w-8 h-8" />,
    },
    {
      title: "Graduación - Universidad Nacional",
      description: "Productos conmemorativos para 1000 graduados",
      products: "Diplomas, medallas, pins, carpetas personalizadas",
      result: "Evento memorable, productos de recuerdo de alta calidad",
      icon: <Award className="w-8 h-8" />,
    },
  ];

  const stats = [
    { number: "500+", label: "Clientes activos", icon: <Building2 className="w-6 h-6" /> },
    { number: "98%", label: "Satisfacción", icon: <Star className="w-6 h-6" /> },
    { number: "10,000+", label: "Productos entregados", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "14+", label: "Años de experiencia", icon: <Award className="w-6 h-6" /> },
  ];

  return (
    <section className="container mx-auto max-w-6xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-3">Clientes que Confían en Nosotros</h1>
        <p className="text-white/80 max-w-2xl mx-auto">
          Más de 500 empresas en Guatemala y Centroamérica confían en GLDS para sus necesidades de merchandising corporativo.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-white/10 bg-white/[.05] p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-glds-primary/10 text-glds-primary mb-3">
              {stat.icon}
            </div>
            <div className="text-3xl font-extrabold text-glds-primary mb-1">{stat.number}</div>
            <div className="text-sm text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Testimonios Destacados</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredTestimonials.map((testimonial, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[.05] p-6 relative">
              <Quote className="w-10 h-10 text-glds-primary/20 absolute top-4 right-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-glds-primary text-glds-primary" />
                ))}
              </div>
              <p className="text-white/80 mb-4 italic">"{testimonial.testimonial}"</p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-glds-primary">{testimonial.role}</p>
                <p className="text-sm text-white/60">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Casos de Éxito</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {caseStudies.map((study, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[.05] p-6 hover:bg-white/[.08] transition">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-glds-primary/10 text-glds-primary mb-4">
                {study.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{study.title}</h3>
              <p className="text-sm text-white/70 mb-3">{study.description}</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-glds-primary">Productos:</span>
                  <p className="text-white/70">{study.products}</p>
                </div>
                <div>
                  <span className="font-semibold text-glds-primary">Resultado:</span>
                  <p className="text-white/70">{study.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Nuestros Clientes por Industria</h2>
        <div className="space-y-8">
          {industries.map((industry, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[.05] p-6">
              <h3 className="text-xl font-bold mb-4 text-glds-primary">{industry.name}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {industry.clients.map((client, cidx) => (
                  <div
                    key={cidx}
                    className="rounded-xl border border-white/10 bg-white/[.03] p-4 hover:bg-white/[.06] transition text-center"
                  >
                    <div className="text-4xl mb-2">{client.logo}</div>
                    <p className="font-semibold mb-1">{client.name}</p>
                    <p className="text-xs text-white/60 italic">"{client.testimonial}"</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-glds-primary/10 to-glds-secondary/10 p-8 text-center">
        <Building2 className="w-12 h-12 text-glds-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">¿Quieres ser parte de nuestros clientes?</h2>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          Únete a las más de 500 empresas que confían en GLDS para fortalecer su imagen corporativa.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-glds-primary px-8 py-3 text-base font-semibold text-zinc-900 hover:shadow-glow transition"
        >
          Solicita tu cotización
        </a>
      </div>
    </section>
  );
}
