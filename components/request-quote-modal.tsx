"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, FileText, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RequestQuoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: string
    name: string
    brand: string
    category: string
    image?: string
    specifications?: Array<{ key: string; value: string }>
  }
}

export function RequestQuoteModal({ open, onOpenChange, product }: RequestQuoteModalProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    quantity: "",
    requirements: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Store inquiry in localStorage
    const inquiries = JSON.parse(localStorage.getItem("inquiries") || "[]")
    inquiries.push({
      id: `INQ-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      email: formData.email,
      quantity: formData.quantity,
      requirements: formData.requirements,
      fileName: file?.name || null,
      status: "New",
      adminNotes: "",
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("inquiries", JSON.stringify(inquiries))

    toast({
      title: "Quote request submitted!",
      description: "We'll get back to you within 24 hours.",
    })

    // Reset form
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      quantity: "",
      requirements: "",
    })
    setFile(null)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Product Context */}
          <div className="lg:w-2/5 bg-muted/50 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r-2 border-border">
            <h3 className="text-xl font-semibold mb-6">Requesting Quote For:</h3>

            <div className="aspect-square rounded-xl overflow-hidden bg-background mb-6 shadow-md">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                <p className="text-sm text-muted-foreground">SKU: {product.id}</p>
                <p className="text-sm text-muted-foreground">Brand: {product.brand}</p>
              </div>

              {/* Key Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h5 className="text-sm font-semibold mb-3">Key Specifications:</h5>
                  <ul className="space-y-2">
                    {product.specifications.slice(0, 5).map((spec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">{spec.key}:</span> {spec.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-3/5 p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Request a Quote</h2>
              <p className="text-muted-foreground">
                Fill in the details below and we'll provide you with a custom quote within 24 hours
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Your company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Contact Person <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder="Your full name"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Number of units"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Special Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Please share any specific requirements, customizations, or questions..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Attach RFP/Document (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  {!file ? (
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
