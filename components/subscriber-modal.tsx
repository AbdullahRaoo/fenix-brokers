"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { subscribeEmail } from "@/app/actions/subscribers"

interface SubscriberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SubscriberModal({ open, onOpenChange }: SubscriberModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await subscribeEmail({ email, name })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.alreadySubscribed) {
        toast({
          title: "Already subscribed!",
          description: "This email is already on our newsletter list.",
        })
      } else {
        toast({
          title: "Successfully subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        })
      }

      // Set a flag to prevent modal from showing again for 30 days
      localStorage.setItem("has_subscribed", "true")
      localStorage.setItem("subscribed_at", new Date().toISOString())

      setName("")
      setEmail("")
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 mx-auto">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Stay Updated</DialogTitle>
          <DialogDescription className="text-center">
            Subscribe to receive exclusive wholesale deals, new product announcements, and industry insights.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
