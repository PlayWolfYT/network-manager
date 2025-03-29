"use client"

import { useState } from "react"
import type { Subnet } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Network, Plus } from "lucide-react"
import { SubnetCard } from "@/components/subnet-card"

interface SubnetOverviewProps {
  subnets: Subnet[]
  onEdit: (subnet: Subnet) => void
  onDelete: (id: string) => void
  onDeleteIpAssignment: (subnetId: string, ipAssignmentId: string) => void
  onCreateSubnet: () => void
}

export function SubnetOverview({
  subnets,
  onEdit,
  onDelete,
  onDeleteIpAssignment,
  onCreateSubnet,
}: SubnetOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter subnets based on search term
  const filteredSubnets = subnets.filter(
    (subnet) =>
      subnet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subnet.cidr.includes(searchTerm) ||
      subnet.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (subnets.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border border-border">
        <Network className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-medium">No Subnets Found</h3>
        <p className="text-muted-foreground mb-4">Add your first subnet to get started with network management.</p>
        <Button onClick={onCreateSubnet} className="bg-primary hover:bg-primary/80 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Your First Subnet
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
          <Network className="h-5 w-5" /> Subnet Management
        </h2>
        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search subnets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border-border focus-visible:ring-primary"
            />
          </div>
          <Button onClick={onCreateSubnet} className="bg-primary hover:bg-primary/80 text-white whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" /> Create Subnet
          </Button>
        </div>
      </div>

      {filteredSubnets.length === 0 ? (
        <div className="text-center p-8 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-medium">No Matching Subnets</h3>
          <p className="text-muted-foreground">No subnets match your search criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubnets.map((subnet) => (
            <SubnetCard
              key={subnet.id}
              subnet={subnet}
              onEdit={onEdit}
              onDelete={onDelete}
              onDeleteIpAssignment={onDeleteIpAssignment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

