"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Subnet, IPAssignment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { isIPInSubnet, findDuplicateIP } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Network, Server } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface CentralizedIPFormProps {
  subnets: Subnet[]
  onSubmit: (subnetId: string, ipAssignment: IPAssignment) => void
  editingIp?: IPAssignment
  editingSubnetId?: string
}

export function CentralizedIPForm({ subnets, onSubmit, editingIp, editingSubnetId }: CentralizedIPFormProps) {
  const [selectedSubnetId, setSelectedSubnetId] = useState<string>(editingSubnetId || "")
  const [formData, setFormData] = useState<Omit<IPAssignment, "id" | "subnetId">>({
    ip: editingIp?.ip || "",
    service: editingIp?.service || "",
    description: editingIp?.description || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicateIP, setDuplicateIP] = useState<(IPAssignment & { subnetName: string }) | null>(null)
  const { addToast } = useToast()

  const selectedSubnet = subnets.find((s) => s.id === selectedSubnetId)

  // Reset form errors when subnet changes
  useEffect(() => {
    setErrors({})
    setDuplicateIP(null)
  }, [selectedSubnetId])

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

    // Clear duplicate IP warning when IP is changed
    if (name === "ip" && duplicateIP) {
      setDuplicateIP(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!selectedSubnetId) {
      newErrors.subnet = "Please select a subnet"
    }

    if (!formData.ip.trim()) {
      newErrors.ip = "IP address is required"
    } else if (selectedSubnet && !isIPInSubnet(formData.ip, selectedSubnet.cidr)) {
      newErrors.ip = `IP must be within the subnet ${selectedSubnet.cidr}`
    }

    if (!formData.service.trim()) {
      newErrors.service = "Service name is required"
    }

    // Check for duplicate IP, excluding the current IP when editing
    const duplicate = findDuplicateIP(formData.ip, subnets, editingIp?.id)
    if (duplicate) {
      setDuplicateIP(duplicate)
      addToast({
        title: "IP Already Assigned",
        description: `The IP address ${duplicate.ip} is already assigned to "${duplicate.service}" in subnet "${duplicate.subnetName}".`,
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(selectedSubnetId, {
      ...formData,
      id: "",
      subnetId: selectedSubnetId,
    })

    // Reset form after submission
    setFormData({
      ip: "",
      service: "",
      description: "",
    })
  }

  if (subnets.length === 0) {
    return (
      <Alert className="bg-blue-950/30 border-blue-900">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertTitle>No subnets available</AlertTitle>
        <AlertDescription>You need to create at least one subnet before you can assign IP addresses.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto bg-card border-border glow-border">
      <CardHeader className="bg-gradient-dark">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Server className="h-5 w-5" /> {editingIp ? "Edit IP Address" : "Assign IP Address"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {editingIp ? "Update the IP address assignment details" : "Assign an IP address to a service within a subnet"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {duplicateIP && (
            <Alert variant="destructive" className="bg-destructive/20 border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>IP Address Already Assigned</AlertTitle>
              <AlertDescription>
                The IP address {duplicateIP.ip} is already assigned to "{duplicateIP.service}" in subnet "
                {duplicateIP.subnetName}".
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="subnet" className="text-primary/90">
              Subnet
            </Label>
            <Select value={selectedSubnetId} onValueChange={setSelectedSubnetId}>
              <SelectTrigger
                id="subnet"
                className={`bg-muted/30 border-border ${errors.subnet ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select a subnet" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {subnets.map((subnet) => (
                  <SelectItem key={subnet.id} value={subnet.id}>
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-primary" />
                      <span>
                        {subnet.name} ({subnet.cidr})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subnet && <p className="text-sm text-destructive">{errors.subnet}</p>}
          </div>

          {selectedSubnet && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ip" className="text-primary/90">
                  IP Address
                </Label>
                <Input
                  id="ip"
                  name="ip"
                  value={formData.ip}
                  onChange={handleChange}
                  placeholder={selectedSubnet.cidr.split("/")[0].replace(/\.\d+$/, ".x")}
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
            </>
          )}
        </CardContent>
        <CardFooter className="border-t border-border bg-card/50 py-4">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-white"
            disabled={!selectedSubnetId || duplicateIP !== null}
          >
            {editingIp ? "Update IP Address" : "Assign IP Address"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

