import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Award, Globe, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">About ProSupply Wholesale</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your trusted partner in B2B wholesale solutions, delivering quality products and exceptional service since
            2010.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Award className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">15+</h3>
            <p className="text-muted-foreground">Years Experience</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">50+</h3>
            <p className="text-muted-foreground">Countries Served</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">10,000+</h3>
            <p className="text-muted-foreground">Business Clients</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">98%</h3>
            <p className="text-muted-foreground">Satisfaction Rate</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 lg:p-12 mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Founded in 2010, ProSupply Wholesale emerged from a simple vision: to make quality industrial and
              commercial products accessible to businesses of all sizes. What started as a small distribution center has
              grown into a leading B2B wholesale platform serving thousands of businesses worldwide.
            </p>
            <p>
              We understand the challenges businesses face in sourcing reliable products at competitive prices. That's
              why we've built strong relationships with manufacturers and suppliers globally, ensuring our clients get
              the best value without compromising on quality.
            </p>
            <p>
              Today, we offer over 1,400 products across multiple categories, from electronics and industrial equipment
              to office supplies and construction materials. Our commitment to customer satisfaction, competitive
              pricing, and reliable service has made us the preferred wholesale partner for businesses across 50
              countries.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Partner With Us?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust ProSupply for their wholesale needs
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
