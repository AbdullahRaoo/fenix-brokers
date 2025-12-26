"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Mail, TrendingUp, Clock, CheckCircle2, Send, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for campaigns
const campaigns = [
  {
    id: "1",
    name: "Spring Product Launch",
    subject: "New Wholesale Products Available",
    dateSent: "2025-01-15",
    status: "sent",
    recipients: 1234,
    openRate: "42.5%",
    clickRate: "12.3%",
  },
  {
    id: "2",
    name: "Holiday Special Offers",
    subject: "Exclusive B2B Holiday Deals",
    dateSent: "2024-12-20",
    status: "sent",
    recipients: 1150,
    openRate: "38.2%",
    clickRate: "9.8%",
  },
  {
    id: "3",
    name: "New Year Catalog Update",
    subject: "Updated Catalog for 2025",
    dateSent: "2025-01-02",
    status: "sent",
    recipients: 1401,
    openRate: "45.1%",
    clickRate: "15.2%",
  },
]

const activeCampaigns = [
  {
    id: "4",
    name: "February Newsletter",
    subject: "Monthly Product Highlights",
    scheduledDate: "2025-02-01",
    status: "scheduled",
    recipients: 1523,
  },
]

export default function MarketingPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Email Marketing</h1>
          <p className="text-muted-foreground">Manage campaigns and design newsletter templates</p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/marketing/templates/new">
              <FileText className="h-4 w-4 mr-2" />
              Create Newsletter Template
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/admin/marketing/campaigns/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length + activeCampaigns.length}</div>
                <p className="text-xs text-muted-foreground">{activeCampaigns.length} active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">41.9%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.4%</div>
                <p className="text-xs text-muted-foreground">+0.8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,523</div>
                <p className="text-xs text-muted-foreground">+43 this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Campaigns currently scheduled or in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {activeCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {activeCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Scheduled: {campaign.scheduledDate}</p>
                          <p className="text-xs text-muted-foreground">{campaign.recipients} recipients</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Scheduled
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active campaigns at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>Previously sent campaigns and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Sent</p>
                        <p className="font-medium">{campaign.dateSent}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Recipients</p>
                        <p className="font-medium">{campaign.recipients.toLocaleString()}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Open Rate</p>
                        <p className="font-medium text-green-600">{campaign.openRate}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground">Click Rate</p>
                        <p className="font-medium text-blue-600">{campaign.clickRate}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                        <Send className="h-3 w-3 mr-1" />
                        Sent
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Newsletter Templates</CardTitle>
                  <CardDescription>Reusable email templates for your campaigns</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/marketing/templates/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Templates will be displayed here. Create your first template to get started.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
