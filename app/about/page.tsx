"use client"

import { useEffect } from "react"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Award,
  Globe,
  Users,
  TrendingUp,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Shield,
  Truck,
  Clock,
  Handshake,
  Lightbulb
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    document.querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right").forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const stats = [
    { icon: Award, value: "15+", label: "Años de Experiencia", color: "from-amber-500/20 to-orange-500/20" },
    { icon: Globe, value: "50+", label: "Países Atendidos", color: "from-blue-500/20 to-cyan-500/20" },
    { icon: Users, value: "2,000+", label: "Socios Comerciales", color: "from-violet-500/20 to-purple-500/20" },
    { icon: TrendingUp, value: "98%", label: "Tasa de Satisfacción", color: "from-emerald-500/20 to-teal-500/20" },
  ]

  const values = [
    {
      icon: Shield,
      title: "Autenticidad Primero",
      description: "Cada producto que vendemos es 100% auténtico, obtenido directamente de distribuidores y fabricantes autorizados."
    },
    {
      icon: Handshake,
      title: "Mentalidad de Alianza",
      description: "Nos vemos como una extensión de tu equipo, comprometidos con tu éxito y crecimiento."
    },
    {
      icon: Lightbulb,
      title: "Impulsados por la Innovación",
      description: "Mejoramos constantemente nuestros procesos y tecnología para servirte mejor."
    },
    {
      icon: Heart,
      title: "Obsesión por el Cliente",
      description: "Tu satisfacción es nuestra principal prioridad. Hacemos todo lo posible para superar las expectativas."
    },
  ]

  const timeline = [
    { year: "2010", title: "Fundación", description: "Comenzamos como una pequeña operación mayorista de belleza en Las Palmas de Gran Canaria" },
    { year: "2013", title: "Expansión", description: "Nos expandimos para atender clientes en toda España y Europa" },
    { year: "2016", title: "Alcance Global", description: "Iniciamos operaciones internacionales, alcanzando más de 20 países" },
    { year: "2019", title: "Transformación Digital", description: "Lanzamos plataforma online para pedidos fluidos" },
    { year: "2022", title: "Líder de la Industria", description: "Nos convertimos en uno de los principales socios mayoristas de belleza globalmente" },
    { year: "2024", title: "Hoy", description: "Atendiendo a 2,000+ minoristas con 500+ marcas premium" },
  ]

  const team = [
    {
      name: "Alexandra Chen",
      role: "CEO y Fundadora",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
      bio: "Más de 15 años de liderazgo en la industria de la belleza"
    },
    {
      name: "Michael Torres",
      role: "Director de Operaciones",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
      bio: "Experto en optimización de cadena de suministro"
    },
    {
      name: "Sarah Williams",
      role: "Directora de Alianzas",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
      bio: "Construyendo relaciones duraderas con marcas"
    },
    {
      name: "David Kim",
      role: "Director de Calidad",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
      bio: "Asegurando estándares de autenticidad del producto"
    },
  ]

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/10 rounded-full blur-lg" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Nosotros</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 mb-6 text-balance">
              Tu <span className="text-primary">Socio de Belleza</span> de Confianza
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Fenix Brokers ha estado conectando minoristas de belleza con marcas premium desde 2010.
              Somos más que un proveedor – somos tu socio en la construcción de un negocio de belleza exitoso.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <stat.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold mb-2">{stat.value}</h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="fade-in-left">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-lg opacity-50" />
                <img
                  src="/images/our-story.png"
                  alt="Nuestro Equipo"
                  className="relative rounded-2xl shadow-xl w-full aspect-[4/3] object-cover"
                />
                {/* Floating card */}
                <div className="absolute -bottom-6 -right-6 bg-card border border-border rounded-xl p-5 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xl">Desde 2010</p>
                      <p className="text-sm text-muted-foreground">Alianza de Confianza</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fade-in-right">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Nuestra Historia</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6 text-balance">
                Construido sobre <span className="text-primary">Confianza y Calidad</span>
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Fundada en 2010, Fenix Brokers surgió de una visión simple: hacer que los productos de belleza premium
                  sean accesibles para minoristas de todos los tamaños. Lo que comenzó como una pequeña operación de
                  distribución se ha convertido en una plataforma mayorista B2B líder que atiende negocios de belleza en todo el mundo.
                </p>
                <p>
                  Entendemos los desafíos que enfrentan los minoristas al obtener productos auténticos a precios competitivos.
                  Es por eso que hemos construido relaciones sólidas con distribuidores autorizados de marcas globalmente,
                  asegurando que nuestros socios obtengan el mejor valor sin comprometer la calidad.
                </p>
                <p>
                  Hoy, ofrecemos más de 500 marcas premium en cuidado de la piel, cosméticos, fragancias y cuidado corporal.
                  Nuestro compromiso con la autenticidad, precios competitivos y servicio excepcional nos ha convertido
                  en el socio mayorista preferido para negocios de belleza en más de 50 países.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Productos 100% Auténticos</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Envío Global</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Nuestro Camino</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Creciendo <span className="text-primary">Juntos</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              De una pequeña operación a un líder mayorista de belleza global
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`fade-in-up relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 inline-block">
                      <span className="text-2xl font-bold text-primary">{item.year}</span>
                      <h3 className="text-xl font-semibold mt-2 mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full ring-4 ring-background" />

                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Nuestros Valores</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Lo Que Nos <span className="text-primary">Impulsa</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Los principios que guían todo lo que hacemos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-card border border-border rounded-2xl p-8 h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Nuestro Equipo</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Conoce a los <span className="text-primary">Expertos</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Profesionales apasionados dedicados a tu éxito
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                    <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-in-up relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-3xl" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-xl" />

            <div className="relative p-12 lg:p-20 text-center">
              <Sparkles className="h-14 w-14 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white text-balance">
                ¿Listo para Asociarte con Nosotros?
              </h2>
              <p className="text-white/80 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
                Únete a miles de minoristas de belleza exitosos. Hagamos crecer tu negocio juntos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-base shadow-xl">
                  <Link href="/contact">
                    Contáctanos <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base bg-transparent border-white/30 text-white hover:bg-white/10">
                  <Link href="/catalog">Ver Productos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .fade-in-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-in-left {
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-in-right {
          opacity: 0;
          transform: translateX(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-in-up.animate-in,
        .fade-in-left.animate-in,
        .fade-in-right.animate-in {
          opacity: 1;
          transform: translateY(0) translateX(0);
        }
      `}</style>
    </div>
  )
}
