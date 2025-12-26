"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Copy, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

// Mock template data
const templates = [
  {
    id: "1",
    name: "Weekly Deals Newsletter",
    description: "Highlight featured products and special offers",
    thumbnail: "/newsletter-email-layout.jpg",
    lastModified: "2025-01-15",
  },
  {
    id: "2",
    name: "Product Showcase",
    description: "Showcase new arrivals and catalog updates",
    thumbnail: "/promotional-email-template.png",
    lastModified: "2025-01-10",
  },
  {
    id: "3",
    name: "Simple Text Update",
    description: "Clean text-based newsletter template",
    thumbnail: "/blank-email-template.png",
    lastModified: "2025-01-05",
  },
]

export default function TemplatesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Newsletter Templates</h1>
          <p className="text-muted-foreground">Manage and create reusable email templates</p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/marketing/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative overflow-hidden">
              <img
                src={template.thumbnail || "/placeholder.svg"}
                alt={template.name}
                className="object-cover w-full h-full"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Last modified: {template.lastModified}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                <Link href={`/admin/marketing/templates/${template.id}/edit`}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-3 w-3 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
