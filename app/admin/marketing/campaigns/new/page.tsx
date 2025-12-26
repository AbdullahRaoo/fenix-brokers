"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, Check, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// Mock templates
const templates = [
  {
    id: "1",
    name: "Weekly Deals Newsletter",
    thumbnail: "/newsletter-email-layout.jpg",
  },
  {
    id: "2",
    name: "Product Showcase",
    thumbnail: "/promotional-email-template.png",
  },
  {
    id: "3",
    name: "Simple Text Update",
    thumbnail: "/blank-email-template.png",
  },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [campaignName, setCampaignName] = useState("")
  const [subject, setSubject] = useState("")
  const [preheader, setPreheader] = useState("")
  const [subscriberList, setSubscriberList] = useState("all")
  const [scheduleType, setScheduleType] = useState("now")
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")

  const handleContinue = () => {
    if (step === 1 && selectedTemplate) {
      setStep(2)
    } else if (step === 2 && campaignName && subject) {
      setStep(3)
    }
  }

  const handleSendCampaign = () => {
    // Handle campaign sending logic
    router.push("/admin/marketing")
  }

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/admin/marketing">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Marketing
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
        <p className="text-muted-foreground">Select a template and configure your campaign</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-semibold mb-2",
                step > 1
                  ? "bg-green-600 text-white"
                  : step === 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {step > 1 ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <span className="text-sm font-medium">Template</span>
          </div>
          <div className="h-px w-20 bg-border" />
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-semibold mb-2",
                step > 2
                  ? "bg-green-600 text-white"
                  : step === 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {step > 2 ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <span className="text-sm font-medium">Configure</span>
          </div>
          <div className="h-px w-20 bg-border" />
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-semibold mb-2",
                step === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              3
            </div>
            <span className="text-sm font-medium">Schedule</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Template */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Template</CardTitle>
            <CardDescription>Choose from your saved templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "border-2 rounded-lg overflow-hidden cursor-pointer transition-all",
                    selectedTemplate === template.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50",
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={template.thumbnail || "/placeholder.svg"}
                      alt={template.name}
                      className="object-cover w-full h-full"
                    />
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2 h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure Settings */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>Configure your campaign settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  placeholder="e.g., March Newsletter"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preheader">Preheader Text</Label>
                <Input
                  id="preheader"
                  placeholder="Preview text that appears after the subject line"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscriber List</CardTitle>
              <CardDescription>Select who will receive this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={subscriberList} onValueChange={setSubscriberList}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Subscribers (1,523)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="font-normal cursor-pointer">
                    Active Subscribers Only (1,401)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Schedule/Send */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Campaign</CardTitle>
            <CardDescription>Choose when to send your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={scheduleType} onValueChange={setScheduleType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now" className="font-normal cursor-pointer">
                  Send immediately
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled" className="font-normal cursor-pointer">
                  Schedule for later
                </Label>
              </div>
            </RadioGroup>

            {scheduleType === "scheduled" && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduleDate">Date</Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleTime">Time</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="border border-border rounded-lg p-4 bg-muted/50 mt-6">
              <h3 className="font-semibold mb-3">Campaign Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Campaign Name:</dt>
                  <dd className="font-medium">{campaignName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subject:</dt>
                  <dd className="font-medium">{subject}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Recipients:</dt>
                  <dd className="font-medium">{subscriberList === "all" ? "1,523" : "1,401"} subscribers</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Send Time:</dt>
                  <dd className="font-medium">
                    {scheduleType === "now" ? "Immediately" : `${scheduleDate} at ${scheduleTime}`}
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => {
            if (step > 1) setStep(step - 1)
            else router.push("/admin/marketing")
          }}
        >
          Back
        </Button>
        {step < 3 ? (
          <Button onClick={handleContinue} disabled={step === 1 ? !selectedTemplate : !campaignName || !subject}>
            Continue
          </Button>
        ) : (
          <Button onClick={handleSendCampaign}>
            <Mail className="h-4 w-4 mr-2" />
            {scheduleType === "now" ? "Send Campaign" : "Schedule Campaign"}
          </Button>
        )}
      </div>
    </div>
  )
}
