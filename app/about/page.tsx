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
    { icon: Award, value: "15+", label: "Years Experience", color: "from-amber-500/20 to-orange-500/20" },
    { icon: Globe, value: "50+", label: "Countries Served", color: "from-blue-500/20 to-cyan-500/20" },
    { icon: Users, value: "2,000+", label: "Business Partners", color: "from-violet-500/20 to-purple-500/20" },
    { icon: TrendingUp, value: "98%", label: "Satisfaction Rate", color: "from-emerald-500/20 to-teal-500/20" },
  ]

  const values = [
    {
      icon: Shield,
      title: "Authenticity First",
      description: "Every product we sell is 100% authentic, sourced directly from authorized distributors and manufacturers."
    },
    {
      icon: Handshake,
      title: "Partnership Mindset",
      description: "We see ourselves as an extension of your team, invested in your success and growth."
    },
    {
      icon: Lightbulb,
      title: "Innovation Driven",
      description: "We constantly improve our processes and technology to serve you better."
    },
    {
      icon: Heart,
      title: "Customer Obsessed",
      description: "Your satisfaction is our top priority. We go above and beyond to exceed expectations."
    },
  ]

  const timeline = [
    { year: "2010", title: "Founded", description: "Started as a small beauty wholesale operation in New York" },
    { year: "2013", title: "Expansion", description: "Expanded to serve clients across North America" },
    { year: "2016", title: "Global Reach", description: "Began international operations, reaching 20+ countries" },
    { year: "2019", title: "Digital Transformation", description: "Launched online platform for seamless ordering" },
    { year: "2022", title: "Industry Leader", description: "Became one of the top beauty wholesale partners globally" },
    { year: "2024", title: "Today", description: "Serving 2,000+ retailers with 500+ premium brands" },
  ]

  const team = [
    {
      name: "Alexandra Chen",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
      bio: "15+ years in beauty industry leadership"
    },
    {
      name: "Michael Torres",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
      bio: "Supply chain optimization expert"
    },
    {
      name: "Sarah Williams",
      role: "Director of Partnerships",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
      bio: "Building lasting brand relationships"
    },
    {
      name: "David Kim",
      role: "Head of Quality",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
      bio: "Ensuring product authenticity standards"
    },
  ]

  return (
    <div className="min-h-screen">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/10 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center fade-in-up">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">About Us</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 mb-6 text-balance">
              Your Trusted <span className="text-primary">Beauty Partner</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Fenix Brokers has been connecting beauty retailers with premium brands since 2010.
              We're more than a supplier – we're your partner in building a successful beauty business.
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
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80"
                  alt="Our Team"
                  className="relative rounded-2xl shadow-xl w-full aspect-[4/3] object-cover"
                />
                {/* Floating card */}
                <div className="absolute -bottom-6 -right-6 bg-card border border-border rounded-xl p-5 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xl">Since 2010</p>
                      <p className="text-sm text-muted-foreground">Trusted Partnership</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fade-in-right">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6 text-balance">
                Built on <span className="text-primary">Trust & Quality</span>
              </h2>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2010, Fenix Brokers emerged from a simple vision: to make premium beauty products
                  accessible to retailers of all sizes. What started as a small distribution operation has
                  grown into a leading B2B wholesale platform serving beauty businesses worldwide.
                </p>
                <p>
                  We understand the challenges retailers face in sourcing authentic products at competitive prices.
                  That's why we've built strong relationships with brand-authorized distributors globally,
                  ensuring our partners get the best value without compromising on quality.
                </p>
                <p>
                  Today, we offer 500+ premium brands across skincare, cosmetics, fragrances, and body care.
                  Our commitment to authenticity, competitive pricing, and exceptional service has made us
                  the preferred wholesale partner for beauty businesses across 50+ countries.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">100% Authentic Products</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Global Shipping</span>
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
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Growing <span className="text-primary">Together</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From a small operation to a global beauty wholesale leader
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
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              What Drives <span className="text-primary">Us</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
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
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Team</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Meet the <span className="text-primary">Experts</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Passionate professionals dedicated to your success
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
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

            <div className="relative p-12 lg:p-20 text-center">
              <Sparkles className="h-14 w-14 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white text-balance">
                Ready to Partner With Us?
              </h2>
              <p className="text-white/80 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of successful beauty retailers. Let's grow your business together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-base shadow-xl">
                  <Link href="/contact">
                    Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base bg-transparent border-white/30 text-white hover:bg-white/10">
                  <Link href="/catalog">Browse Products</Link>
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
