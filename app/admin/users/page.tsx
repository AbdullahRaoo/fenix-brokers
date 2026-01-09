"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Loader2, UserCog, Shield, Eye, Pencil } from "lucide-react"
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, changePassword, type AdminUser } from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
    const { toast } = useToast()

    // Create form state
    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newName, setNewName] = useState("")
    const [newRole, setNewRole] = useState<"admin" | "editor" | "viewer">("editor")

    // Edit form state
    const [editName, setEditName] = useState("")
    const [editRole, setEditRole] = useState<"admin" | "editor" | "viewer">("editor")
    const [editPassword, setEditPassword] = useState("")

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setIsLoading(true)
        const result = await getAdminUsers()
        if (result.data) {
            setUsers(result.data)
        }
        setIsLoading(false)
    }

    const handleCreate = () => {
        if (!newEmail || !newPassword || !newName) {
            toast({ title: "Error", description: "Por favor completa todos los campos", variant: "destructive" })
            return
        }

        startTransition(async () => {
            const result = await createAdminUser({
                email: newEmail,
                password: newPassword,
                name: newName,
                role: newRole,
            })

            if (result.success) {
                toast({ title: "Usuario creado" })
                setIsCreateOpen(false)
                setNewEmail("")
                setNewPassword("")
                setNewName("")
                setNewRole("editor")
                loadUsers()
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" })
            }
        })
    }

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user)
        setEditName(user.name)
        setEditRole(user.role)
        setEditPassword("")
    }

    const handleSaveEdit = () => {
        if (!editingUser) return

        startTransition(async () => {
            const result = await updateAdminUser(editingUser.id, {
                name: editName,
                role: editRole,
            })

            if (editPassword) {
                await changePassword(editingUser.id, editPassword)
            }

            if (result.success) {
                toast({ title: "Usuario actualizado" })
                setEditingUser(null)
                loadUsers()
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" })
            }
        })
    }

    const handleDelete = (user: AdminUser) => {
        if (!confirm(`¿Eliminar usuario "${user.name}"? Esta acción no se puede deshacer.`)) return

        startTransition(async () => {
            const result = await deleteAdminUser(user.id)

            if (result.success) {
                toast({ title: "Usuario eliminado" })
                setUsers(users.filter(u => u.id !== user.id))
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" })
            }
        })
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "admin": return <Shield className="h-3 w-3" />
            case "editor": return <Pencil className="h-3 w-3" />
            case "viewer": return <Eye className="h-3 w-3" />
            default: return null
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin": return "bg-red-500/10 text-red-600"
            case "editor": return "bg-blue-500/10 text-blue-600"
            case "viewer": return "bg-muted text-muted-foreground"
            default: return ""
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">Administrar cuentas de administrador y permisos</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Usuario
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Usuario Administrador</DialogTitle>
                            <DialogDescription>Agregar un nuevo usuario al panel de administración.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Juan Pérez"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="juan@fenixbrokers.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mín. 6 caracteres"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <Select value={newRole} onValueChange={(v) => setNewRole(v as typeof newRole)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin - Acceso completo</SelectItem>
                                        <SelectItem value="editor">Editor - Puede editar contenido</SelectItem>
                                        <SelectItem value="viewer">Visor - Solo lectura</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreate} disabled={isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Crear Usuario
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Role Legend */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">Permisos de Rol</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Badge className={getRoleColor("admin")}><Shield className="h-3 w-3 mr-1" /> Admin</Badge>
                            <span className="text-muted-foreground">Acceso completo a todas las funciones</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge className={getRoleColor("editor")}><Pencil className="h-3 w-3 mr-1" /> Editor</Badge>
                            <span className="text-muted-foreground">Puede editar productos, consultas, marketing</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Badge className={getRoleColor("viewer")}><Eye className="h-3 w-3 mr-1" /> Visor</Badge>
                            <span className="text-muted-foreground">Acceso solo lectura al panel</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Usuarios Administradores</CardTitle>
                    <CardDescription>Todos los usuarios con acceso al panel de administración</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No se encontraron usuarios. Crea tu primer usuario administrador.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Último Acceso</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge className={getRoleColor(user.role)}>
                                                {getRoleIcon(user.role)}
                                                <span className="ml-1 capitalize">{user.role}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "Nunca"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(user)}
                                                    disabled={isPending}
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
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>Actualizar información del usuario y rol.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre Completo</Label>
                            <Input
                                id="edit-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Rol</Label>
                            <Select value={editRole} onValueChange={(v) => setEditRole(v as typeof editRole)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="viewer">Visor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="Dejar vacío para mantener la actual"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                        <Button onClick={handleSaveEdit} disabled={isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
