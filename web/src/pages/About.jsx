import { Award, Users, Target, Heart, TrendingUp, Shield, Clock, Globe } from "lucide-react";

export default function About() {
  const timeline = [
    { year: "2010", event: "Fundación de GLDS", description: "Iniciamos con la visión de revolucionar el merchandising en Guatemala" },
    { year: "2015", event: "Expansión regional", description: "Ampliamos nuestros servicios a toda Centroamérica" },
    { year: "2018", event: "Certificación ISO", description: "Obtuvimos certificación de calidad internacional" },
    { year: "2020", event: "Transformación digital", description: "Lanzamos nuestra plataforma de cotización en línea" },
    { year: "2024", event: "Más de 500 clientes", description: "Alcanzamos la confianza de más de 500 empresas" },
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Calidad",
      description: "Productos de la más alta calidad que representan tu marca con excelencia",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Puntualidad",
      description: "Cumplimos con los tiempos de entrega prometidos, siempre",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Pasión",
      description: "Amamos lo que hacemos y se refleja en cada proyecto",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Confianza",
      description: "Construimos relaciones duraderas basadas en la transparencia",
    },
  ];

  const team = [
    {
      name: "Carlos Méndez",
      role: "Director General",
      description: "15 años de experiencia en merchandising corporativo",
    },
    {
      name: "Ana Rodríguez",
      role: "Gerente de Ventas",
      description: "Especialista en soluciones personalizadas para empresas",
    },
    {
      name: "Luis García",
      role: "Director de Producción",
      description: "Experto en procesos de marcaje y personalización",
    },
    {
      name: "María López",
      role: "Diseñadora Gráfica",
      description: "Creativa detrás de los diseños más innovadores",
    },
  ];

  const stats = [
    { number: "500+", label: "Clientes satisfechos" },
    { number: "10,000+", label: "Productos entregados" },
    { number: "14+", label: "Años de experiencia" },
    { number: "98%", label: "Tasa de satisfacción" },
  ];

  const certifications = [
    { name: "ISO 9001", description: "Gestión de Calidad" },
    { name: "Eco-Friendly", description: "Productos sostenibles" },
    { name: "Fast Delivery", description: "Entregas garantizadas" },
    { name: "Custom Design", description: "Diseño personalizado" },
  ];

  return (
    <section className="container mx-auto max-w-6xl px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-glds-primary to-glds-secondary bg-clip-text text-transparent">
          Acerca de GLDS
        </h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Somos líderes en merchandising corporativo y productos promocionales en Guatemala,
          transformando ideas en experiencias tangibles que fortalecen tu marca.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-white/10 bg-white/[.05] p-6 text-center">
            <div className="text-4xl font-extrabold text-glds-primary mb-2">{stat.number}</div>
            <div className="text-sm text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.05] p-8 mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-glds-primary" />
          <h2 className="text-3xl font-bold">Nuestra Historia</h2>
        </div>
        <p className="text-white/80 text-lg leading-relaxed mb-8">
          Desde 2010, GLDS ha sido el socio estratégico de cientos de empresas en Guatemala y Centroamérica,
          ayudándolas a fortalecer su identidad corporativa a través de productos promocionales de alta calidad.
          Comenzamos como un pequeño taller de serigrafía y hoy somos una empresa integral que ofrece soluciones
          completas de merchandising, desde el diseño hasta la entrega.
        </p>
        <p className="text-white/80 text-lg leading-relaxed">
          Nuestra misión es simple pero poderosa: hacer que cada producto cuente una historia y fortalezca
          la conexión entre las marcas y sus audiencias. Con un equipo apasionado y tecnología de vanguardia,
          seguimos innovando para ofrecer las mejores soluciones del mercado.
        </p>
      </div>

      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Nuestro Recorrido</h2>
          <p className="text-white/70">Los hitos que nos han definido</p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-glds-primary to-glds-secondary" />
          <div className="space-y-12">
            {timeline.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex-1 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="rounded-2xl border border-white/10 bg-white/[.05] p-6">
                    <div className="text-2xl font-bold text-glds-primary mb-2">{item.year}</div>
                    <h3 className="text-xl font-semibold mb-2">{item.event}</h3>
                    <p className="text-white/70">{item.description}</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full bg-glds-primary border-4 border-zinc-900 z-10" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Nuestros Valores</h2>
          <p className="text-white/70">Los principios que guían nuestro trabajo</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[.05] p-6 text-center hover:bg-white/[.08] transition">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-glds-primary/10 text-glds-primary mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-sm text-white/70">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Nuestro Equipo</h2>
          <p className="text-white/70">Las personas detrás de GLDS</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[.05] p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-glds-primary to-glds-secondary mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12 text-zinc-900" />
              </div>
              <h3 className="text-lg font-bold mb-1">{member.name}</h3>
              <p className="text-sm text-glds-primary mb-2">{member.role}</p>
              <p className="text-xs text-white/70">{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Certificaciones y Garantías</h2>
          <p className="text-white/70">Nuestro compromiso con la excelencia</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/[.05] p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-glds-primary/10 mb-4">
                <Award className="w-8 h-8 text-glds-primary" />
              </div>
              <h3 className="font-bold mb-1">{cert.name}</h3>
              <p className="text-sm text-white/70">{cert.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-glds-primary/10 to-glds-secondary/10 p-8 text-center">
        <TrendingUp className="w-12 h-12 text-glds-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">¿Listo para trabajar con nosotros?</h2>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          Únete a las más de 500 empresas que confían en GLDS para sus necesidades de merchandising corporativo.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-glds-primary px-8 py-3 text-base font-semibold text-zinc-900 hover:shadow-glow transition"
        >
          Contáctanos hoy
        </a>
      </div>
    </section>
  );
}
