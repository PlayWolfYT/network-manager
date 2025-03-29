"use client"

import type React from "react"

import { useState } from "react"
import type { IPAssignment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { isIPInSubnet } from "@/lib/utils"

interface IPAssignmentFormProps {
  onSubmit: (ipAssignment: IPAssignment) => void
  onCancel: () => void
  subnetCidr: string
}

export function IPAssignmentForm({ onSubmit, onCancel, subnetCidr }: IPAssignmentFormProps) {
  const [formData, setFormData] = useState<Omit<IPAssignment, "id" | "subnetId">>({
    ip: "",
    service: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.ip.trim()) {
      newErrors.ip = "IP address is required"
    } else if (!isIPInSubnet(formData.ip, subnetCidr)) {
      newErrors.ip = `IP must be within the subnet ${subnetCidr}`
    }

    if (!formData.service.trim()) {
      newErrors.service = "Service name is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      ...formData,
      id: "",
      subnetId: "", // This will be set by the parent component
    })
  }

  return (
    <div className="w-full space-y-4 border rounded-md p-4 bg-card border-border">
      <h3 className="font-medium text-primary/90">Add IP Assignment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ip" className="text-primary/90">
            IP Address
          </Label>
          <Input
            id="ip"
            name="ip"
            value={formData.ip}
            onChange={handleChange}
            placeholder="192.168.1.10"
            aria-invalid={!!errors.ip}
            className="bg-muted/30 border-border focus-visible:ring-primary"
          />
          {errors.ip && <p className="text-sm text-destructive">{errors.ip}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="service" className="text-primary/90">
            Service Name
          </Label>
          <Input
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            placeholder="Home Router"
            aria-invalid={!!errors.service}
            className="bg-muted/30 border-border focus-visible:ring-primary"
          />
          {errors.service && <p className="text-sm text-destructive">{errors.service}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-primary/90">
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Main router for the network"
            rows={2}
            className="bg-muted/30 border-border focus-visible:ring-primary"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-border hover:bg-muted/50 hover:text-primary/90"
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-primary hover:bg-primary/80 text-white">
            Add IP
          </Button>
        </div>
      </form>
    </div>
  )
}

