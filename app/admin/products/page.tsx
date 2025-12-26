"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Pencil, Trash2, Loader2, RotateCcw, Eye, EyeOff, MoreHorizontal, CheckSquare } from "lucide-react"
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
  updateProduct,
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string | null>(null)
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
      if (currentTab === "all") {
        setProducts(result.data.filter(p => p.status !== "trash"))
      } else {
        setProducts(result.data)
      }
    }
    setSelectedIds(new Set())
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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map(p => p.id)))
    }
  }

  const handleBulkAction = (action: string) => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    startTransition(async () => {
      let count = 0
      for (const id of ids) {
        let result: { success?: boolean; error?: string | null }
        switch (action) {
          case "publish":
            result = await publishProduct(id)
            break
          case "unpublish":
            result = await unpublishProduct(id)
            break
          case "trash":
            result = await trashProduct(id)
            break
          case "restore":
            result = await restoreProduct(id)
            break
          case "delete":
            result = await deleteProductPermanently(id)
            break
          default:
            result = { success: false }
        }
        if (result.success) count++
      }

      toast({ title: `${count} product${count !== 1 ? "s" : ""} updated` })
      loadProducts()
      loadCounts()
      setSelectedIds(new Set())
    })
  }

  const handleEmptyTrash = () => {
    startTransition(async () => {
      const result = await emptyTrash()
      if (result.success) {
        toast({ title: "Trash emptied", description: `${result.count} products deleted` })
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
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="published">Published ({counts.published})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({counts.trash})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentTab === "all" ? "All Products" : currentTab === "trash" ? "Trash" : `${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Products`}
              </CardTitle>
              <CardDescription>{products.length} products</CardDescription>
            </div>
            <div className="flex gap-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
                <Button type="submit" variant="secondary" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              {currentTab === "trash" && counts.trash > 0 && can("products.delete") && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Empty Trash</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete {counts.trash} products.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleEmptyTrash} className="bg-destructive">Delete All</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
              <Checkbox checked={selectedIds.size === products.length} onCheckedChange={toggleSelectAll} />
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <div className="flex gap-2 ml-auto">
                {currentTab === "trash" ? (
                  <>
                    <Can permission="products.edit">
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction("restore")} disabled={isPending}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    </Can>
                    <Can permission="products.delete">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isPending}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {selectedIds.size} products?</AlertDialogTitle>
                            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBulkAction("delete")} className="bg-destructive">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </Can>
                  </>
                ) : (
                  <>
                    <Can permission="products.edit">
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction("publish")} disabled={isPending}>
                        <Eye className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction("unpublish")} disabled={isPending}>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Unpublish
                      </Button>
                    </Can>
                    <Can permission="products.delete">
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleBulkAction("trash")} disabled={isPending}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Trash
                      </Button>
                    </Can>
                  </>
                )}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {currentTab === "trash" ? (
                <p>Trash is empty</p>
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
                  <TableHead className="w-10">
                    <Checkbox checked={selectedIds.size === products.length && products.length > 0} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={selectedIds.has(product.id) ? "bg-muted/50" : undefined}>
                    <TableCell>
                      <Checkbox checked={selectedIds.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {currentTab === "trash" ? (
                            <>
                              <Can permission="products.edit">
                                <DropdownMenuItem onClick={() => { setSelectedIds(new Set([product.id])); handleBulkAction("restore"); }}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                              </Can>
                              <Can permission="products.delete">
                                <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedIds(new Set([product.id])); handleBulkAction("delete"); }}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Permanently
                                </DropdownMenuItem>
                              </Can>
                            </>
                          ) : (
                            <>
                              <Can permission="products.edit">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/products/${product.id}`}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                {product.status === "draft" ? (
                                  <DropdownMenuItem onClick={() => { setSelectedIds(new Set([product.id])); handleBulkAction("publish"); }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => { setSelectedIds(new Set([product.id])); handleBulkAction("unpublish"); }}>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </DropdownMenuItem>
                                )}
                              </Can>
                              <DropdownMenuSeparator />
                              <Can permission="products.delete">
                                <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedIds(new Set([product.id])); handleBulkAction("trash"); }}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Move to Trash
                                </DropdownMenuItem>
                              </Can>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
