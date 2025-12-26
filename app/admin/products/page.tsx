"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Pencil, Trash2, Loader2, RotateCcw, Eye, EyeOff, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAuth, Can } from "@/components/auth-context"
import {
  getProducts,
  getProductCounts,
  trashProduct,
  restoreProduct,
  deleteProductPermanently,
  emptyTrash,
  publishProduct,
  unpublishProduct,
  type ProductStatus,
} from "@/app/actions/products"
import type { Product } from "@/types/database"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [counts, setCounts] = useState({ all: 0, draft: 0, published: 0, trash: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTab, setCurrentTab] = useState<"all" | ProductStatus>("all")
  const { toast } = useToast()
  const { can } = useAuth()

  useEffect(() => {
    loadProducts()
    loadCounts()
  }, [currentTab])

  async function loadProducts() {
    setIsLoading(true)
    const result = await getProducts({
      status: currentTab === "all" ? undefined : currentTab,
      search: searchQuery || undefined,
    })
    if (result.data) {
      // For "all" tab, exclude trash
      if (currentTab === "all") {
        setProducts(result.data.filter(p => p.status !== "trash"))
      } else {
        setProducts(result.data)
      }
    }
    setIsLoading(false)
  }

  async function loadCounts() {
    const result = await getProductCounts()
    if (!result.error) {
      setCounts(result)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadProducts()
  }

  const handleTrash = (product: Product) => {
    startTransition(async () => {
      const result = await trashProduct(product.id)
      if (result.success) {
        toast({ title: "Product moved to trash" })
        loadProducts()
        loadCounts()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleRestore = (product: Product) => {
    startTransition(async () => {
      const result = await restoreProduct(product.id)
      if (result.success) {
        toast({ title: "Product restored" })
        loadProducts()
        loadCounts()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleDeletePermanently = (product: Product) => {
    startTransition(async () => {
      const result = await deleteProductPermanently(product.id)
      if (result.success) {
        toast({ title: "Product permanently deleted" })
        loadProducts()
        loadCounts()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleEmptyTrash = () => {
    startTransition(async () => {
      const result = await emptyTrash()
      if (result.success) {
        toast({ title: "Trash emptied", description: `${result.count} products permanently deleted` })
        loadProducts()
        loadCounts()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handlePublish = (product: Product) => {
    startTransition(async () => {
      const result = await publishProduct(product.id)
      if (result.success) {
        toast({ title: "Product published" })
        loadProducts()
        loadCounts()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleUnpublish = (product: Product) => {
    startTransition(async () => {
      const result = await unpublishProduct(product.id)
      if (result.success) {
        toast({ title: "Product unpublished" })
        loadProducts()
        loadCounts()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/10 text-green-600">Published</Badge>
      case "draft":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Draft</Badge>
      case "trash":
        return <Badge className="bg-red-500/10 text-red-600">Trash</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Can permission="products.create">
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </Can>
      </div>

      {/* Status Tabs */}
      <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as typeof currentTab)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            All <span className="ml-1.5 text-xs text-muted-foreground">({counts.all})</span>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published <span className="ml-1.5 text-xs text-muted-foreground">({counts.published})</span>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft <span className="ml-1.5 text-xs text-muted-foreground">({counts.draft})</span>
          </TabsTrigger>
          <TabsTrigger value="trash">
            Trash <span className="ml-1.5 text-xs text-muted-foreground">({counts.trash})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentTab === "all" ? "All Products" : currentTab === "trash" ? "Trash" : `${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Products`}
              </CardTitle>
              <CardDescription>
                {currentTab === "trash"
                  ? "Items in trash will be permanently deleted after 30 days"
                  : `${products.length} product${products.length !== 1 ? "s" : ""}`
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button type="submit" variant="secondary" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              {currentTab === "trash" && counts.trash > 0 && can("products.delete") && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Empty Trash
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {counts.trash} products in trash. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleEmptyTrash} className="bg-destructive text-destructive-foreground">
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {currentTab === "trash" ? (
                <>
                  <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Trash is empty</p>
                </>
              ) : (
                <>
                  <p>No products found</p>
                  {can("products.create") && (
                    <Button asChild className="mt-4">
                      <Link href="/admin/products/new">Add your first product</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.category || "-"}</TableCell>
                    <TableCell>${product.price?.toFixed(2) || "-"}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        product.stock_status === "In Stock" ? "border-green-500 text-green-600" :
                          product.stock_status === "Low Stock" ? "border-yellow-500 text-yellow-600" :
                            "border-red-500 text-red-600"
                      }>
                        {product.stock_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {currentTab === "trash" ? (
                          // Trash actions
                          <>
                            <Can permission="products.edit">
                              <Button variant="ghost" size="sm" onClick={() => handleRestore(product)} disabled={isPending}>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                            </Can>
                            <Can permission="products.delete">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive" disabled={isPending}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete &quot;{product.title}&quot;. This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeletePermanently(product)} className="bg-destructive">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Can>
                          </>
                        ) : (
                          // Normal actions
                          <>
                            <Can permission="products.edit">
                              {product.status === "draft" ? (
                                <Button variant="ghost" size="sm" onClick={() => handlePublish(product)} disabled={isPending}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Publish
                                </Button>
                              ) : product.status === "published" ? (
                                <Button variant="ghost" size="sm" onClick={() => handleUnpublish(product)} disabled={isPending}>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Unpublish
                                </Button>
                              ) : null}
                            </Can>
                            <Can permission="products.edit">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/products/${product.id}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            </Can>
                            <Can permission="products.delete">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleTrash(product)}
                                disabled={isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </Can>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
