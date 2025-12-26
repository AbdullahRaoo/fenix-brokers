"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const presetLayouts = [
  {
    id: "weekly-deal",
    name: "Weekly Deal",
    description: "Perfect for weekly promotions and featured products",
    thumbnail: "/newsletter-email-layout.jpg",
  },
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "Highlight multiple products in a grid layout",
    thumbnail: "/promotional-email-template.png",
  },
  {
    id: "simple-text",
    name: "Simple Text",
    description: "Clean text-only newsletter template",
    thumbnail: "/blank-email-template.png",
  },
  {
    id: "promo-banner",
    name: "Promotional Banner",
    description: "Large hero image with CTA",
    thumbnail: "/product-email-showcase.jpg",
  },
  {
    id: "catalog-update",
    name: "Catalog Update",
    description: "Announce new catalog items",
    thumbnail: "/newsletter-email-layout.jpg",
  },
  {
    id: "seasonal-offer",
    name: "Seasonal Offer",
    description: "Holiday and seasonal campaigns",
    thumbnail: "/promotional-email-template.png",
  },
]

export default function NewTemplatePage() {
  const router = useRouter()

  const selectLayout = (layoutId: string) => {
    router.push(`/admin/marketing/templates/editor?layout=${layoutId}`)
  }

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/marketing">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Marketing
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Template</h1>
        <p className="text-muted-foreground">Step 1: Choose a starting layout or clone an existing template</p>
      </div>

      <div className="space-y-6">
        {/* Pre-made Layouts */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-made Layouts</CardTitle>
            <CardDescription>Start with a professionally designed layout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presetLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className="border border-border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
                  onClick={() => selectLayout(layout.id)}
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={layout.thumbnail || "/placeholder.svg"}
                      alt={layout.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1">{layout.name}</h3>
                    <p className="text-xs text-muted-foreground">{layout.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clone Previous Template */}
        <Card>
          <CardHeader>
            <CardTitle>Clone Previous Template</CardTitle>
            <CardDescription>Start from an existing template you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/admin/marketing/templates">
                <FileText className="h-4 w-4 mr-2" />
                Browse Templates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
