"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Sparkles,
  Truck,
  Globe,
  HeadphonesIcon,
  CheckCircle2,
  Star,
  Shield,
  Zap,
  Award,
  Users,
  Package,
  TrendingUp,
  Heart,
  Clock,
  BadgeCheck
} from "lucide-react"
import SubscriberModal from "@/components/subscriber-modal"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { getProducts, getCategoriesWithCount } from "@/app/actions/products"
import type { Product } from "@/types/database"

export default function HomePage() {
  const [showSubscriberModal, setShowSubscriberModal] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categoryData, setCategoryData] = useState<{ name: string; count: number; image_url: string | null; description: string | null }[]>([])
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const hasSubscribed = localStorage.getItem("has_subscribed")
    const subscribedAt = localStorage.getItem("subscribed_at")

    if (!hasSubscribed || (subscribedAt && Date.now() - new Date(subscribedAt).getTime() > 30 * 24 * 60 * 60 * 1000)) {
      const timer = setTimeout(() => {
        setShowSubscriberModal(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      // Load published products
      const productsResult = await getProducts({ sortBy: 'newest', status: 'published', limit: 6 })
      if (productsResult.data) {
        setFeaturedProducts(productsResult.data)
      }

      // Load categories with counts
      const categoriesResult = await getCategoriesWithCount()
      if (categoriesResult.data) {
        setCategoryData(categoriesResult.data)
      }
    }
    loadData()
  }, [])

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

    // Re-observe when content changes (products load)
    document.querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right, .scale-in").forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [featuredProducts, categoryData]) // Re-run when products or categories load

  // Default fallback images for categories (used only if no image is set in database)
  const defaultCategoryImages: Record<string, { image: string; description: string }> = {
    "Perfumes": { image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80", description: "Fragancias de lujo de las mejores marcas" },
    "Skincare": { image: "https://images.unsplash.com/photo-1570194065650-d99fb4a38b97?w=600&q=80", description: "Soluciones profesionales para el cuidado de la piel" },
    "Makeup": { image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80", description: "Colección de cosméticos de alta gama" },
    "Hair Care": { image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80", description: "Productos capilares de calidad de salón" },
    "Body Care": { image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80", description: "Tratamientos corporales de lujo" },
    "Gift Sets": { image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&q=80", description: "Colecciones de regalo premium seleccionadas" },
  }

  // Use database category data with fallback to default images
  const categories = categoryData.length > 0
    ? categoryData.map(cat => ({
      name: cat.name,
      count: cat.count,
      // Prioritize database image, then fallback to default, then generic placeholder
      image: cat.image_url || defaultCategoryImages[cat.name]?.image || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
      // Prioritize database description, then fallback to default
      description: cat.description || defaultCategoryImages[cat.name]?.description || "Productos de belleza premium"
    }))
    : []

  const clientLogos = ["Sephora", "Ulta Beauty", "Douglas", "Boots", "Marionnaud", "Nocibé", "Macy's", "Nordstrom"]

  const stats = [
    { icon: Package, value: "500+", label: "Marcas Premium", suffix: "" },
    { icon: Users, value: "2,000+", label: "Minoristas Satisfechos", suffix: "" },
    { icon: Globe, value: "50+", label: "Países Atendidos", suffix: "" },
    { icon: TrendingUp, value: "98%", label: "Satisfacción del Cliente", suffix: "" },
  ]

  const features = [
    {
      icon: Shield,
      title: "100% Auténtico",
      description: "Cada producto proviene directamente de distribuidores autorizados con trazabilidad completa y certificados de autenticidad.",
      color: "from-cyan-500/20 to-blue-500/20"
    },
    {
      icon: Truck,
      title: "Envío Global",
      description: "Logística con temperatura controlada asegurando la calidad del producto. Entrega express disponible en más de 50 países.",
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte Experto",
      description: "Especialistas dedicados en la industria de la belleza que te ayudan a construir la combinación perfecta de productos para tu negocio.",
      color: "from-violet-500/20 to-purple-500/20"
    },
    {
      icon: Zap,
      title: "Cumplimiento Rápido",
      description: "Pedidos procesados en 24 horas. Seguimiento de inventario en tiempo real y sugerencias de reorden automatizadas.",
      color: "from-amber-500/20 to-orange-500/20"
    },
    {
      icon: Award,
      title: "Precios Competitivos",
      description: "Descuentos por volumen de hasta 40% del precio minorista. Términos de pago flexibles incluyendo Net 30/60 para compradores calificados.",
      color: "from-rose-500/20 to-pink-500/20"
    },
    {
      icon: Heart,
      title: "Selección Curada",
      description: "Productos en tendencia y más vendidos seleccionados a mano. Acceso exclusivo anticipado a nuevos lanzamientos.",
      color: "from-indigo-500/20 to-blue-500/20"
    },
  ]

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden py-24 lg:py-32">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,190,214,0.15),transparent_50%)]"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(88,135,218,0.1),transparent_40%)]"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-secondary/30 rounded-full blur-lg animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 animate-shimmer">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Socio Mayorista Premium</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6 leading-[1.1]">
                Cosméticos{" "}
                <span className="text-primary relative">
                  Premium
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                y Fragancias al Por Mayor
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed max-w-lg">
                Obtén productos de belleza auténticos a precios mayoristas inigualables. Desde perfumes de lujo hasta cuidado de la piel profesional,
                abastecemos a <span className="text-foreground font-medium">minoristas, salones y negocios de belleza</span> en todo el mundo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button asChild size="lg" className="text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Link href="/catalog">
                    Ver Catálogo <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base group">
                  <Link href="/contact">
                    Solicitar Precios
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs group-hover:bg-primary group-hover:text-white transition-colors">→</span>
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Proveedor Verificado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Respuesta en 24h</span>
                </div>
              </div>
            </div>

            <div className="fade-in-right lg:block hidden relative">
              {/* Main hero image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
                  alt="Cosméticos de Lujo"
                  className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                  style={{ transform: `translateY(${scrollY * 0.03}px)` }}
                />

                {/* Floating card - brands */}
                <div
                  className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl animate-float"
                  style={{ transform: `translateY(${-scrollY * 0.02}px)` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xl">500+</p>
                      <p className="text-sm text-muted-foreground">Marcas Premium</p>
                    </div>
                  </div>
                </div>

                {/* Floating card - satisfaction */}
                <div
                  className="absolute -top-4 -right-4 bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl animate-float-delayed"
                  style={{ transform: `translateY(${-scrollY * 0.015}px)` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm font-medium">Calificación 4.9/5</p>
                  <p className="text-xs text-muted-foreground">por 2000+ minoristas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling logos section */}
      <section className="py-12 bg-muted/30 border-y border-border/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8 font-semibold uppercase tracking-wider">
            Confianza de los Principales Minoristas de Belleza del Mundo
          </p>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex gap-16 animate-scroll">
              {[...clientLogos, ...clientLogos, ...clientLogos].map((logo, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 text-2xl font-bold text-muted-foreground/30 hover:text-primary transition-colors duration-300 cursor-default"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="fade-in-up text-center group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Por Qué Elegirnos</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4 text-balance">
              Tu <span className="text-primary">Socio de Belleza</span> de Confianza
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Proporcionamos todo lo que necesitas para abastecer productos de belleza premium y hacer crecer tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="fade-in-up group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-card border border-border rounded-2xl p-8 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-24 bg-muted/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Categorías</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4 text-balance">
              Comprar por <span className="text-primary">Categoría</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explora nuestra selección curada de productos de belleza premium en todas las categorías
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={`/catalog?category=${encodeURIComponent(category.name)}`}
                className="fade-in-up group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-2.5 py-1 bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full mb-2 shadow-lg">
                    {category.count} productos
                  </span>
                  <h3 className="text-xl font-semibold mb-1 text-balance group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 fade-in-up">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Nuevos Productos</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-2 text-balance">
                Últimas <span className="text-primary">Novedades</span>
              </h2>
              <p className="text-muted-foreground text-lg">Productos nuevos recién agregados a nuestra colección</p>
            </div>
            <Button asChild variant="outline" className="group">
              <Link href="/catalog">
                Ver Todos los Productos
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {featuredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Ver Detalles</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">{product.title}</h3>
                    <p className="text-base font-bold text-primary">
                      {product.show_price && product.price ? `$${product.price}` : "Solicitar Cotización"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-24 bg-muted/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="fade-in-left order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
                <img
                  src="/logos/PNG/logo-fenix-brokers-11.png"
                  alt="Fenix Brokers"
                  className="relative rounded-2xl shadow-xl w-full"
                />
              </div>
            </div>

            <div className="fade-in-right order-1 lg:order-2">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Alianza</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6 text-balance">
                Tu <span className="text-primary">Socio</span> de Negocios de Belleza
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Con más de una década de experiencia en la industria cosmética, Fenix Brokers conecta minoristas y
                profesionales con marcas de belleza premium. Nosotros nos encargamos del abastecimiento, control de
                calidad y logística para que tú puedas enfocarte en hacer crecer tu negocio.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { title: "Proveedores Verificados", desc: "Alianzas directas con distribuidores autorizados de marcas" },
                  { title: "Términos de Pago Flexibles", desc: "Términos Net 30/60 disponibles para compradores calificados" },
                  { title: "Opciones de Pedido Mínimo Bajo", desc: "Comienza pequeño y escala a medida que crece tu negocio" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                <Link href="/about">
                  Conoce Más Sobre Nosotros <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Testimonios</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4 text-balance">
              Lo Que Dicen Nuestros <span className="text-primary">Socios</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Confianza de minoristas y profesionales de belleza en todo el mundo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Propietaria, Glow Beauty Boutique",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
                quote: "Fenix Brokers transformó nuestro inventario. La garantía de autenticidad y los precios competitivos nos ayudaron a aumentar los márgenes en un 40%. ¡Un socio excepcional!",
                rating: 5,
              },
              {
                name: "María Rodríguez",
                role: "Gerente de Compras, Luxe Cosmetics",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
                quote: "Su servicio al cliente es excepcional. Entienden la industria de la belleza y siempre recomiendan productos que conectan con nuestros clientes.",
                rating: 5,
              },
              {
                name: "Emma Thompson",
                role: "CEO, Belle Beauty Chain",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
                quote: "Llevamos 5 años colaborando con Fenix. Su fiabilidad y variedad de productos han sido fundamentales en nuestra expansión a 12 ubicaciones.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="fade-in-up bg-card border border-border rounded-2xl p-8 relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Quote decoration */}
                <div className="absolute -top-4 left-8 text-7xl text-primary/10 font-serif leading-none">"</div>

                <div className="flex gap-1 mb-4 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed relative z-10 text-lg">
                  {testimonial.quote}
                </p>

                <div className="flex items-center gap-4 relative z-10">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-primary/10"
                  />
                  <div>
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4 text-balance">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about partnering with us
            </p>
          </div>

          <div className="space-y-4 fade-in-up">
            {[
              {
                question: "What are your minimum order quantities?",
                answer: "Our MOQs vary by product category. For most items, we offer low MOQs starting from just 10 units to help new retailers get started. Larger orders qualify for volume discounts of up to 40%.",
              },
              {
                question: "How do you guarantee product authenticity?",
                answer: "All our products are sourced directly from authorized distributors and manufacturers. Each shipment includes certificates of authenticity, batch codes, and full supply chain traceability.",
              },
              {
                question: "What payment terms do you offer?",
                answer: "We offer flexible payment options including Net 30, Net 60, and credit facilities for qualified buyers. New customers typically start with prepayment and can transition to credit terms after establishing a track record.",
              },
              {
                question: "Do you ship internationally?",
                answer: "Yes! We ship to over 50 countries worldwide. Our logistics partners ensure temperature-controlled shipping to preserve product quality. All customs documentation is handled by our experienced team.",
              },
              {
                question: "Can I request samples before ordering?",
                answer: "Absolutely! We offer a comprehensive sample program for qualified retailers. Contact our sales team with your business details and product interests to request samples.",
              },
              {
                question: "How quickly can I expect my order?",
                answer: "Orders are processed within 24 hours of payment confirmation. Domestic shipments typically arrive in 3-5 business days, while international orders take 7-14 business days depending on destination.",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-open:bg-primary transition-colors duration-300">
                    <ArrowRight className="h-5 w-5 text-primary group-open:text-white group-open:rotate-90 transition-all duration-300" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center fade-in-up">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
              <Link href="/contact">
                Contact Our Team <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-in-up relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-3xl" />

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />

            <div className="relative p-12 lg:p-20 text-center">
              <Sparkles className="h-16 w-16 text-white/80 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white text-balance">
                Ready to Stock Premium Beauty?
              </h2>
              <p className="text-white/80 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of successful retailers. Get access to exclusive wholesale pricing on 500+ premium beauty brands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-base shadow-xl hover:shadow-2xl transition-shadow">
                  <Link href="/catalog">
                    Browse Products <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base bg-transparent border-white/30 text-white hover:bg-white/10">
                  <Link href="/contact">Request a Callback</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Subscriber Modal */}
      <SubscriberModal open={showSubscriberModal} onOpenChange={setShowSubscriberModal} />

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
        
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
        
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
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
        
        .scale-in {
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-in-up.animate-in,
        .fade-in-left.animate-in,
        .fade-in-right.animate-in,
        .scale-in.animate-in {
          opacity: 1;
          transform: translateY(0) translateX(0) scale(1);
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  )
}
