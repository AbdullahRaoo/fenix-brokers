"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, FileText, Sparkles, ShoppingBag, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const templates = [
  {
    id: "blank",
    name: "Blank Template",
    description: "Start from scratch with a blank canvas",
    icon: FileText,
    preview: "/blank-email-template.png",
  },
  {
    id: "newsletter",
    name: "Newsletter Layout",
    description: "Classic newsletter format with sections",
    icon: Sparkles,
    preview: "/newsletter-email-layout.jpg",
  },
  {
    id: "promotional",
    name: "Promotional Layout",
    description: "Product-focused promotional template",
    icon: ShoppingBag,
    preview: "/promotional-email-template.png",
  },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedTemplate) {
      router.push(`/admin/marketing/create/editor?template=${selectedTemplate}`)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/marketing">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Marketing
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
        <p className="text-muted-foreground">Step 1 of 3: Choose a template</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mb-2">
              1
            </div>
            <span className="text-sm font-medium">Template</span>
          </div>
          <div className="h-px w-20 bg-border" />
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold mb-2">
              2
            </div>
            <span className="text-sm text-muted-foreground">Design</span>
          </div>
          <div className="h-px w-20 bg-border" />
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold mb-2">
              3
            </div>
            <span className="text-sm text-muted-foreground">Review</span>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedTemplate === template.id && "ring-2 ring-primary",
            )}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">{template.description}</CardDescription>
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/admin/marketing">Cancel</Link>
        </Button>
        <Button onClick={handleContinue} disabled={!selectedTemplate} size="lg">
          Continue to Editor
        </Button>
      </div>
    </div>
  )
}
