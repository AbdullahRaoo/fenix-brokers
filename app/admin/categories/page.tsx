"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Plus,
    Pencil,
    Trash2,
    FolderTree,
    Loader2,
    Image as ImageIcon,
    Package
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MediaPicker } from "@/components/media-picker"
import {
    getCategories as getCategoriesFromDB,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryProductCount
} from "@/app/actions/categories"

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    created_at: string
    updated_at: string
    product_count?: number
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image_url: "",
    })

    useEffect(() => {
        loadCategories()
    }, [])

    async function loadCategories() {
        setIsLoading(true)
        const result = await getCategoriesFromDB()
        if (result.data) {
            // Get product counts for each category
            const categoriesWithCounts = await Promise.all(
                result.data.map(async (cat: Category) => {
                    const countResult = await getCategoryProductCount(cat.name)
                    return { ...cat, product_count: countResult.count || 0 }
                })
            )
            setCategories(categoriesWithCounts)
        }
        setIsLoading(false)
    }

    function openCreateDialog() {
        setEditingCategory(null)
        setFormData({ name: "", description: "", image_url: "" })
        setIsDialogOpen(true)
    }

    function openEditDialog(category: Category) {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
            image_url: category.image_url || "",
        })
        setIsDialogOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (editingCategory) {
                const result = await updateCategory(editingCategory.id, formData)
                if (result.error) {
                    toast({ title: "Error", description: result.error, variant: "destructive" })
                } else {
                    toast({ title: "Éxito", description: "Categoría actualizada exitosamente" })
                    setIsDialogOpen(false)
                    loadCategories()
                }
            } else {
                const result = await createCategory(formData)
                if (result.error) {
                    toast({ title: "Error", description: result.error, variant: "destructive" })
                } else {
                    toast({ title: "Éxito", description: "Categoría creada exitosamente" })
                    setIsDialogOpen(false)
                    loadCategories()
                }
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred", variant: "destructive" })
        }

        setIsSubmitting(false)
    }

    async function handleDelete(category: Category) {
        if (!confirm(`¿Estás seguro de eliminar "${category.name}"? Esto no eliminará los productos de esta categoría.`)) {
            return
        }

        const result = await deleteCategory(category.id)
        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        } else {
            toast({ title: "Éxito", description: "Categoría eliminada exitosamente" })
            loadCategories()
        }
    }

    function handleImageSelect(url: string) {
        setFormData({ ...formData, image_url: url })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FolderTree className="h-6 w-6 text-primary" />
                        Categorías de Productos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Administra las categorías de productos de tu catálogo
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Categoría
                </Button>
            </div>

            {/* Categories Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-16">
                        <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="font-semibold mb-2">Aún no hay categorías</h3>
                        <p className="text-muted-foreground mb-4">Crea tu primera categoría para organizar productos</p>
                        <Button onClick={openCreateDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Categoría
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Imagen</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                                <TableHead className="text-center">Productos</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                                            {category.image_url ? (
                                                <img
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{category.name}</p>
                                            <p className="text-xs text-muted-foreground">{category.slug}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {category.description || "—"}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                                            <Package className="h-3 w-3" />
                                            {category.product_count || 0}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(category)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(category)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Editar Categoría" : "Crear Categoría"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de Categoría *</Label>
                            <Input
                                id="name"
                                placeholder="ej., Cuidado de Piel, Maquillaje, Perfumes"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                placeholder="Breve descripción de esta categoría..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Imagen de Categoría</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="URL de imagen"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="flex-1"
                                />
                                <MediaPicker
                                    value={formData.image_url}
                                    onSelect={handleImageSelect}
                                    trigger={
                                        <Button type="button" variant="outline">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    }
                                />
                            </div>
                            {formData.image_url && (
                                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                                    <img
                                        src={formData.image_url}
                                        alt="Vista previa"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Guardando...
                                    </>
                                ) : (
                                    editingCategory ? "Actualizar Categoría" : "Crear Categoría"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

