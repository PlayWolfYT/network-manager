"use client"

import type { Subnet, IPAssignment } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cpu, Trash2, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface IPOverviewProps {
  subnets: Subnet[]
  onDeleteIpAssignment: (subnetId: string, ipAssignmentId: string) => void
  onEditIpAssignment: (subnetId: string, ipAssignment: IPAssignment) => void
}

export function IPOverview({ subnets, onDeleteIpAssignment, onEditIpAssignment }: IPOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Flatten all IP assignments from all subnets
  const allIPs = subnets.flatMap((subnet) =>
    (subnet.ipAssignments || []).map((ip) => ({
      ...ip,
      subnetName: subnet.name,
      subnetCidr: subnet.cidr,
    })),
  )

  // Filter IPs based on search term
  const filteredIPs = allIPs.filter(
    (ip) =>
      ip.ip.includes(searchTerm) ||
      ip.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.subnetName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (allIPs.length === 0) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border border-border">
        <Cpu className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-medium">No IP Assignments Found</h3>
        <p className="text-muted-foreground">Assign IPs to services to start managing your network.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
          <Cpu className="h-5 w-5" /> IP Assignments
        </h2>
        <div className="w-full max-w-xs">
          <Input
            placeholder="Search IPs, services, or subnets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border-border focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-gradient-dark">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[120px] text-primary/90">IP Address</TableHead>
              <TableHead className="text-primary/90">Service</TableHead>
              <TableHead className="hidden md:table-cell text-primary/90">Description</TableHead>
              <TableHead className="text-primary/90">Subnet</TableHead>
              <TableHead className="w-[80px] text-right text-primary/90">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIPs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No IP assignments match your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredIPs.map((ip) => (
                <TableRow key={ip.id} className="border-border hover:bg-muted/30">
                  <TableCell className="font-mono text-primary/90">{ip.ip}</TableCell>
                  <TableCell className="font-medium">{ip.service}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{ip.description || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-muted/50 border-border">
                      {ip.subnetName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditIpAssignment(ip.subnetId, ip)}
                        aria-label={`Edit IP assignment ${ip.ip}`}
                        className="hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteIpAssignment(ip.subnetId, ip.id)}
                        aria-label={`Delete IP assignment ${ip.ip}`}
                        className="hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

