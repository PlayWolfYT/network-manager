"use client"

import { useState, useEffect } from "react"
import type { Subnet, IPAssignment, ViewType } from "@/lib/types"
import { useToast } from "@/components/ui/toast"
import { NetworkTabs } from "@/components/network-tabs"
import { SubnetOverview } from "@/components/subnet-overview"
import { IPOverview } from "@/components/ip-overview"
import { CentralizedIPForm } from "@/components/centralized-ip-form"
import { SubnetForm } from "@/components/subnet-form"
import { DashboardOverview } from "@/components/dashboard-overview"
import { Loader2 } from "lucide-react"

interface NetworkDashboardProps {
  networkId: string
}

export function NetworkDashboard({ networkId }: NetworkDashboardProps) {
  const [subnets, setSubnets] = useState<Subnet[]>([])
  const [editingSubnet, setEditingSubnet] = useState<Subnet | null>(null)
  const [activeView, setActiveView] = useState<ViewType>("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  // Fetch subnets from the API
  const fetchSubnets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/networks/${networkId}/subnets`)
      if (response.ok) {
        const data = await response.json()
        setSubnets(data)
      } else {
        throw new Error("Failed to fetch subnets")
      }
    } catch (error) {
      console.error("Error fetching subnets:", error)
      addToast({
        title: "Error",
        description: "Failed to load network data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubnets()
  }, [networkId])

  const handleAddSubnet = async (subnet: Omit<Subnet, "id" | "ipAssignments">) => {
    try {
      const response = await fetch(`/api/networks/${networkId}/subnets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subnet),
      })

      if (!response.ok) {
        throw new Error("Failed to add subnet")
      }

      const newSubnet = await response.json()
      setSubnets([...subnets, newSubnet])

      addToast({
        title: "Success",
        description: "Subnet added successfully",
        variant: "success",
      })

      setActiveView("subnets")
    } catch (error) {
      console.error("Error adding subnet:", error)
      addToast({
        title: "Error",
        description: "Failed to add subnet",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubnet = async (updatedSubnet: Subnet) => {
    try {
      const response = await fetch(`/api/networks/${networkId}/subnets/${updatedSubnet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSubnet),
      })

      if (!response.ok) {
        throw new Error("Failed to update subnet")
      }

      setSubnets(
        subnets.map((subnet) =>
          subnet.id === updatedSubnet.id ? { ...updatedSubnet, ipAssignments: subnet.ipAssignments } : subnet
        ),
      )

      addToast({
        title: "Success",
        description: "Subnet updated successfully",
        variant: "success",
      })

      setEditingSubnet(null)
    } catch (error) {
      console.error("Error updating subnet:", error)
      addToast({
        title: "Error",
        description: "Failed to update subnet",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubnet = async (id: string) => {
    try {
      const response = await fetch(`/api/networks/${networkId}/subnets/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete subnet")
      }

      setSubnets(subnets.filter((subnet) => subnet.id !== id))

      addToast({
        title: "Success",
        description: "Subnet deleted successfully",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting subnet:", error)
      addToast({
        title: "Error",
        description: "Failed to delete subnet",
        variant: "destructive",
      })
    }
  }

  const handleAddIpAssignment = async (subnetId: string, ipAssignment: IPAssignment) => {
    try {
      const subnet = subnets.find((s) => s.id === subnetId)

      const response = await fetch(`/api/networks/${networkId}/subnets/${subnetId}/ip-assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ip: ipAssignment.ip,
          service: ipAssignment.service,
          description: ipAssignment.description,
          subnetId,
        }),
      })

      if (response.ok) {
        const newIpAssignment = await response.json()

        setSubnets(
          subnets.map((subnet) => {
            if (subnet.id === subnetId) {
              return {
                ...subnet,
                ipAssignments: [...subnet.ipAssignments, newIpAssignment],
              }
            }
            return subnet
          }),
        )

        addToast({
          title: "IP Assignment Added",
          description: `IP ${ipAssignment.ip} has been assigned to ${ipAssignment.service} in subnet ${subnet?.name}.`,
          variant: "success",
          duration: 3000,
        })

        // Switch to IP overview after adding
        setActiveView("ips")
      } else {
        throw new Error("Failed to add IP assignment")
      }
    } catch (error) {
      console.error("Error adding IP assignment:", error)
      addToast({
        title: "Error",
        description: "Failed to add IP assignment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteIpAssignment = async (subnetId: string, ipAssignmentId: string) => {
    try {
      const subnet = subnets.find((s) => s.id === subnetId)
      const ip = subnet?.ipAssignments.find((ip) => ip.id === ipAssignmentId)

      const response = await fetch(`/api/networks/${networkId}/subnets/${subnetId}/ip-assignments/${ipAssignmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSubnets(
          subnets.map((subnet) => {
            if (subnet.id === subnetId) {
              return {
                ...subnet,
                ipAssignments: subnet.ipAssignments.filter((ip) => ip.id !== ipAssignmentId),
              }
            }
            return subnet
          }),
        )

        addToast({
          title: "IP Assignment Removed",
          description: ip
            ? `IP ${ip.ip} is no longer assigned to ${ip.service}.`
            : "The IP assignment has been removed.",
          variant: "info",
          duration: 3000,
        })
      } else {
        throw new Error("Failed to delete IP assignment")
      }
    } catch (error) {
      console.error("Error deleting IP assignment:", error)
      addToast({
        title: "Error",
        description: "Failed to delete IP assignment",
        variant: "destructive",
      })
    }
  }

  const handleCreateSubnet = () => {
    setActiveView("create")
  }

  const renderActiveView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading network data...</span>
        </div>
      )
    }

    // If editing a subnet, show the edit form regardless of active view
    if (editingSubnet) {
      return <SubnetForm onSubmit={handleUpdateSubnet} initialData={editingSubnet} existingSubnets={subnets} />
    }

    switch (activeView) {
      case "dashboard":
        return <DashboardOverview subnets={subnets} onCreateSubnet={handleCreateSubnet} />
      case "subnets":
        return (
          <SubnetOverview
            subnets={subnets}
            onEdit={setEditingSubnet}
            onDelete={handleDeleteSubnet}
            onDeleteIpAssignment={handleDeleteIpAssignment}
            onCreateSubnet={handleCreateSubnet}
          />
        )
      case "create":
        return <SubnetForm onSubmit={handleAddSubnet} existingSubnets={subnets} />
      case "ips":
        return <IPOverview subnets={subnets} onDeleteIpAssignment={handleDeleteIpAssignment} />
      case "assign":
        return <CentralizedIPForm subnets={subnets} onSubmit={handleAddIpAssignment} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <NetworkTabs activeView={activeView} onChange={setActiveView} />
      {renderActiveView()}
    </div>
  )
}

