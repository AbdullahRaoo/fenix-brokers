"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Loader2, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSession, updateAdminUser, changePassword, type AdminUser } from "@/app/actions/auth"
import { MediaPicker } from "@/components/media-picker"
import { getSetting, updateSettings } from "@/app/actions/settings"

export default function SettingsPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // General Settings
  const [siteName, setSiteName] = useState("")
  const [logo, setLogo] = useState("")

  // Profile
  const [name, setName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      // Load user session
      const session = await getSession()
      if (session.user) {
        setUser(session.user)
        setName(session.user.name)
      }

      // Load site settings from database
      const [logoResult, siteNameResult] = await Promise.all([
        getSetting("logo_url"),
        getSetting("site_name")
      ])

      if (logoResult.data?.value) {
        setLogo(logoResult.data.value)
      }
      if (siteNameResult.data?.value) {
        setSiteName(siteNameResult.data.value)
      }

      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleSaveGeneral = async () => {
    setIsSavingSettings(true)

    const result = await updateSettings([
      { key: "logo_url", value: logo || null },
      { key: "site_name", value: siteName || null }
    ])

    setIsSavingSettings(false)

    if (result.success) {
      toast({
        title: "Settings saved",
        description: "General settings have been updated.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save settings",
        variant: "destructive"
      })
    }
  }

  const handleSaveProfile = () => {
    if (!user) return

    startTransition(async () => {
      const result = await updateAdminUser(user.id, { name })

      if (result.success) {
        toast({ title: "Profile updated" })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleChangePassword = () => {
    if (!user) return

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" })
      return
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }

    startTransition(async () => {
      const result = await changePassword(user.id, newPassword)

      if (result.success) {
        toast({ title: "Password updated" })
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="general">Site Settings</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                    {user?.role}
                  </span>
                  <span className="text-xs text-muted-foreground">Contact an admin to change your role</span>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button onClick={handleChangePassword} disabled={isPending || !newPassword}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General/Site Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
              <CardDescription>Configure site name and logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Your site name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center gap-4">
                  {logo ? (
                    <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted">
                      <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLogo("")}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <MediaPicker
                      onSelect={(url) => setLogo(url)}
                      trigger={
                        <Button variant="outline" size="sm" type="button">
                          <Upload className="h-4 w-4 mr-2" />
                          {logo ? "Change Logo" : "Upload Logo"}
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveGeneral} disabled={isSavingSettings}>
                {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connected services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Supabase</p>
                    <p className="text-sm text-muted-foreground">Database & Authentication</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Resend</p>
                    <p className="text-sm text-muted-foreground">Email Delivery</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
