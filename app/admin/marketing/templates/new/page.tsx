"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, FileText, Megaphone, PartyPopper, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { templatePresets, type TemplatePreset } from "@/lib/template-presets"

const categoryIcons = {
  promotional: Megaphone,
  newsletter: FileText,
  announcement: Sparkles,
  welcome: PartyPopper,
}

const categoryColors = {
  promotional: "bg-pink-500/10 text-pink-600",
  newsletter: "bg-blue-500/10 text-blue-600",
  announcement: "bg-purple-500/10 text-purple-600",
  welcome: "bg-green-500/10 text-green-600",
}

export default function NewTemplatePage() {
  const router = useRouter()
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedPreset) {
      router.push(`/admin/marketing/templates/editor?preset=${selectedPreset}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/marketing">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketing
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create Email Template</h1>
        <p className="text-muted-foreground">Choose a starting point for your newsletter</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templatePresets.map((preset) => {
          const Icon = categoryIcons[preset.category]
          const isSelected = selectedPreset === preset.id

          return (
            <Card
              key={preset.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                }`}
              onClick={() => setSelectedPreset(preset.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge className={categoryColors[preset.category]}>
                    <Icon className="h-3 w-3 mr-1" />
                    {preset.category.charAt(0).toUpperCase() + preset.category.slice(1)}
                  </Badge>
                  {isSelected && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Template Preview */}
                <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-muted to-muted/50 mb-4 overflow-hidden relative">
                  {preset.id === "blank" ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto mb-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Blank Canvas</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 p-4 flex flex-col">
                      {/* Mini preview of template structure - using brand color */}
                      <div className="bg-slate-900 h-8 rounded-t-lg" />
                      <div className="flex-1 bg-white p-2 space-y-2">
                        <div className="h-2 bg-gray-200 rounded w-3/4" />
                        <div className="h-1.5 bg-gray-100 rounded w-full" />
                        <div className="h-1.5 bg-gray-100 rounded w-5/6" />
                        {preset.category === "promotional" && (
                          <div className="h-12 bg-gray-100 rounded mt-2" />
                        )}
                        <div className="flex gap-2 mt-2">
                          <div className="h-8 w-8 bg-gray-100 rounded" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2 bg-gray-200 rounded w-1/2" />
                            <div className="h-1.5 bg-gray-100 rounded w-3/4" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-800 h-6 rounded-b-lg" />
                    </div>
                  )}
                </div>

                <CardTitle className="text-lg mb-1">{preset.name}</CardTitle>
                <CardDescription className="text-sm">{preset.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/admin/marketing">Cancel</Link>
        </Button>
        <Button onClick={handleContinue} disabled={!selectedPreset}>
          Continue to Editor
        </Button>
      </div>
    </div>
  )
}
