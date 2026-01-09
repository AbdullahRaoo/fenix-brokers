"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Code, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const productsData = [
  {
    id: "PROD-001",
    name: "Industrial LED Light Panel 60W",
    brand: "LumenTech",
    category: "Electronics",
    image: "/industrial-led-panel.jpg",
    price: "Request Quote",
  },
  {
    id: "PROD-002",
    name: "Heavy Duty Power Drill Set",
    brand: "PowerMax",
    category: "Industrial Equipment",
    image: "/power-drill-set.jpg",
    price: "Request Quote",
  },
  {
    id: "PROD-003",
    name: "Office Chair Ergonomic Pro",
    brand: "ComfortSeating",
    category: "Office Supplies",
    image: "/ergonomic-office-chair.jpg",
    price: "Request Quote",
  },
  {
    id: "PROD-004",
    name: "Steel Beam 20ft I-Section",
    brand: "SteelCore",
    category: "Construction Materials",
    image: "/steel-i-beam.jpg",
    price: "Request Quote",
  },
  {
    id: "PROD-005",
    name: "Commercial Coffee Maker 12-Cup",
    brand: "BrewMaster",
    category: "Office Supplies",
    image: "/commercial-coffee-maker.jpg",
    price: "Request Quote",
  },
  {
    id: "PROD-006",
    name: "Warehouse Shelving Unit",
    brand: "StoragePro",
    category: "Industrial Equipment",
    image: "/warehouse-shelving-unit.jpg",
    price: "Request Quote",
  },
  {
    id: "PROD-007",
    name: "Security Camera System 8-Channel",
    brand: "SecureVision",
    category: "Electronics",
    image: "/security-camera-system.jpg",
    price: "Request Quote",
  },
  {
    id: "PROD-008",
    name: "Concrete Mix Pro Grade 50lb",
    brand: "BuildStrong",
    category: "Construction Materials",
    image: "/concrete-mix-bags.jpg",
    price: "Request Quote",
  },
]

export default function EmailCampaignsPage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [subjectLine, setSubjectLine] = useState("New Wholesale Products Available")
  const [preheader, setPreheader] = useState("Check out our latest additions to the catalog")
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview")
  const { toast } = useToast()

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const generateEmailHTML = () => {
    const selectedProductsData = productsData.filter((p) => selectedProducts.includes(p.id))

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subjectLine}</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #0f172a; padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .preheader { color: #e2e8f0; margin-top: 8px; font-size: 14px; }
        .content { padding: 40px 20px; }
        .product-grid { display: grid; gap: 20px; }
        .product-card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .product-image { width: 100%; height: 200px; object-fit: cover; }
        .product-info { padding: 16px; }
        .product-brand { color: #6b7280; font-size: 12px; margin-bottom: 4px; }
        .product-name { color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px 0; }
        .product-price { color: #6366f1; font-size: 14px; font-weight: 500; margin-bottom: 12px; }
        .cta-button { display: inline-block; background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background-color: #0f172a; color: #e2e8f0; padding: 30px 20px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>ProSupply Wholesale</h1>
            <p class="preheader">${preheader}</p>
        </div>
        <div class="content">
            <h2 style="color: #111827; margin-top: 0;">${subjectLine}</h2>
            <p style="color: #6b7280; line-height: 1.6;">We're excited to showcase our latest products perfect for your business needs.</p>
            <div class="product-grid">
${selectedProductsData
        .map(
          (product) => `                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <p class="product-brand">${product.brand}</p>
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">${product.price}</p>
                        <a href="#" class="cta-button">Request Quote</a>
                    </div>
                </div>`,
        )
        .join("\n")}
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2025 ProSupply Wholesale. All rights reserved.</p>
            <p>Your trusted B2B wholesale partner</p>
        </div>
    </div>
</body>
</html>`
  }

  const handleSendCampaign = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Sin productos seleccionados",
        description: "Por favor selecciona al menos un producto para la campaña.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "¡Campaña lista!",
      description: `Campaña de email generada con ${selectedProducts.length} productos.`,
    })
  }

  const handleCopyHTML = () => {
    navigator.clipboard.writeText(generateEmailHTML())
    toast({
      title: "¡HTML copiado!",
      description: "El HTML del email ha sido copiado al portapapeles.",
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Generador de Campañas de Email</h1>
        <p className="text-muted-foreground">Crea hermosas campañas de email con productos seleccionados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Product Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Campaña</CardTitle>
              <CardDescription>Configura los detalles de tu campaña de email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Línea de Asunto</Label>
                <Input
                  id="subject"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  placeholder="Ingresa línea de asunto..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preheader">Texto de Pre-encabezado</Label>
                <Input
                  id="preheader"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Ingresa texto de pre-encabezado..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Productos</CardTitle>
              <CardDescription>
                Elige productos para incluir en tu campaña ({selectedProducts.length} seleccionados)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {productsData.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={product.id}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleProductToggle(product.id)}
                      className="mt-1"
                    />
                    <label htmlFor={product.id} className="flex-1 cursor-pointer">
                      <div className="flex gap-3">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                          <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vista Previa de Campaña</CardTitle>
                  <CardDescription>Vista previa de tu campaña de email</CardDescription>
                </div>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "preview" | "code")}>
                  <TabsList>
                    <TabsTrigger value="preview">
                      <Eye className="h-4 w-4 mr-2" />
                      Vista Previa
                    </TabsTrigger>
                    <TabsTrigger value="code">
                      <Code className="h-4 w-4 mr-2" />
                      HTML
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {selectedProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona productos para ver la vista previa de la campaña</p>
                </div>
              ) : (
                <>
                  {viewMode === "preview" ? (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={generateEmailHTML()}
                        className="w-full h-[600px] bg-white"
                        title="Email Preview"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto h-[600px] overflow-y-auto">
                        <code>{generateEmailHTML()}</code>
                      </pre>
                      <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={handleCopyHTML}>
                        Copiar HTML
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleSendCampaign} className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Generar Campaña
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
