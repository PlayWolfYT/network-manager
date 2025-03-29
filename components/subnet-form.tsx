"use client"

import type React from "react"

import { useState } from "react"
import type { Subnet } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { validateCIDR, findOverlappingSubnet } from "@/lib/utils"
import { Network, Plus, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SubnetFormProps {
  onSubmit: (subnet: Subnet) => void
  initialData?: Subnet | null
  existingSubnets: Subnet[]
}

export function SubnetForm({ onSubmit, initialData, existingSubnets }: SubnetFormProps) {
  const [formData, setFormData] = useState<Omit<Subnet, "id" | "ipAssignments">>({
    name: initialData?.name || "",
    cidr: initialData?.cidr || "",
    description: initialData?.description || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [overlappingSubnet, setOverlappingSubnet] = useState<Subnet | null>(null)

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

    // Clear overlapping subnet warning when CIDR is changed
    if (name === "cidr" && overlappingSubnet) {
      setOverlappingSubnet(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Subnet name is required"
    }

    if (!formData.cidr.trim()) {
      newErrors.cidr = "CIDR notation is required"
    } else if (!validateCIDR(formData.cidr)) {
      newErrors.cidr = "Invalid CIDR notation (e.g. 192.168.1.0/24)"
    } else {
      // Check for overlapping subnets
      const overlap = findOverlappingSubnet(formData.cidr, existingSubnets, initialData?.id)

      if (overlap) {
        newErrors.cidr = `Overlaps with existing subnet: ${overlap.name} (${overlap.cidr})`
        setOverlappingSubnet(overlap)
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      ...formData,
      id: initialData?.id || "",
      ipAssignments: initialData?.ipAssignments || [],
    })

    // Reset form if not editing
    if (!initialData) {
      setFormData({
        name: "",
        cidr: "",
        description: "",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card border-border glow-border">
      <CardHeader className="bg-gradient-dark">
        <CardTitle className="flex items-center gap-2 text-primary">
          {initialData ? (
            <>
              <Network className="h-5 w-5" /> Edit Subnet
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" /> Create New Subnet
            </>
          )}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {overlappingSubnet && (
            <Alert variant="destructive" className="bg-destructive/20 border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Subnet Conflict Detected</AlertTitle>
              <AlertDescription>
                The CIDR range {formData.cidr} overlaps with existing subnet "{overlappingSubnet.name}" (
                {overlappingSubnet.cidr}). Please choose a different CIDR range.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-primary/90">
              Subnet Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Home Network"
              aria-invalid={!!errors.name}
              className="bg-muted/30 border-border focus-visible:ring-primary"
            />
            {errors.name && <p className="text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidr" className="text-primary/90">
              CIDR Notation
            </Label>
            <Input
              id="cidr"
              name="cidr"
              value={formData.cidr}
              onChange={handleChange}
              placeholder="192.168.1.0/24"
              aria-invalid={!!errors.cidr}
              className="bg-muted/30 border-border focus-visible:ring-primary"
            />
            {errors.cidr && <p className="text-destructive">{errors.cidr}</p>}
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
              placeholder="Main home network for personal devices"
              rows={3}
              className="bg-muted/30 border-border focus-visible:ring-primary"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border bg-card/50 py-4">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-white"
            disabled={!!overlappingSubnet}
          >
            {initialData ? "Update" : "Create"} Subnet
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

