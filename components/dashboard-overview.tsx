"use client"

import { useState } from "react"
import type { Subnet } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Network, Search, Cpu, Plus, Info } from "lucide-react"
import { calculateSubnetStats, findSubnetForIP } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DashboardOverviewProps {
  subnets: Subnet[]
  onCreateSubnet: () => void
}

export function DashboardOverview({ subnets, onCreateSubnet }: DashboardOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubnet, setSelectedSubnet] = useState<string | null>(null)

  // Get all subnets with their stats
  const subnetsWithStats = subnets.map((subnet) => ({
    ...subnet,
    stats: calculateSubnetStats(subnet),
  }))

  // Check if search term looks like an IP address
  const ipRegex = /^(\d{1,3}\.){0,3}\d{1,3}$/
  const isSearchingIP = ipRegex.test(searchTerm)

  // Process IP search
  const ipSearchResult = isSearchingIP ? findSubnetForIP(searchTerm, subnets) : null

  // Get total stats
  const totalSubnets = subnets.length
  const totalIPs = subnets.reduce((sum, subnet) => sum + (subnet.ipAssignments?.length || 0), 0)

  // Get all IP assignments for the table
  const allIPs = subnets.flatMap((subnet) =>
    (subnet.ipAssignments || []).map((ip) => ({
      ...ip,
      subnetName: subnet.name,
      subnetCidr: subnet.cidr,
    })),
  )

  // Filter IPs based on search term and selected subnet
  const filteredIPs = allIPs.filter((ip) => {
    const matchesSearch = !searchTerm ||
      ip.ip.includes(searchTerm) ||
      ip.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.subnetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubnet = !selectedSubnet || ip.subnetName === selectedSubnet

    return matchesSearch && matchesSubnet
  }).slice(0, 10) // Show only first 10 IPs

  const handleSubnetClick = (subnetName: string) => {
    setSelectedSubnet(selectedSubnet === subnetName ? null : subnetName)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
          <LayoutDashboard className="h-5 w-5" /> Network Overview
        </h2>
        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search IPs, subnets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 bg-card border-border focus-visible:ring-primary"
            />
          </div>
          <Button onClick={onCreateSubnet} className="bg-primary hover:bg-primary/80 text-white whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" /> Create Subnet
          </Button>
        </div>
      </div>

      {/* IP Search Result */}
      {isSearchingIP && ipSearchResult && (
        <Card className="border-border bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              IP Search: <span className="font-mono">{searchTerm}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!ipSearchResult.subnet ? (
              <Alert className="bg-muted/30 border-border">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription>This IP doesn't belong to any configured subnet.</AlertDescription>
              </Alert>
            ) : ipSearchResult.isComplete && ipSearchResult.isAssigned ? (
              <div className="space-y-2">
                <p className="ip-assigned flex items-center gap-1">
                  <Cpu className="h-4 w-4" /> This IP is assigned to a device
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Device</p>
                    <p className="font-medium">{ipSearchResult.assignment?.service}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Subnet</p>
                    <p className="font-medium">{ipSearchResult.subnet?.name}</p>
                  </div>
                  {ipSearchResult.assignment?.description && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p>{ipSearchResult.assignment.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : ipSearchResult.isComplete ? (
              <div className="space-y-2">
                <p className="ip-available flex items-center gap-1">
                  <Network className="h-4 w-4" /> This IP is available for assignment
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Subnet</p>
                  <p className="font-medium">
                    {ipSearchResult.subnet?.name} ({ipSearchResult.subnet?.cidr})
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Alert className="bg-muted/30 border-border">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    {searchTerm.split(".").length === 4
                      ? "Please enter a valid IP address to check its status."
                      : "Continue typing to enter a complete IP address."}
                  </AlertDescription>
                </Alert>

                <div className="space-y-1 mt-2">
                  <p className="text-sm text-muted-foreground">Possible Subnet</p>
                  <p className="font-medium">
                    {ipSearchResult.subnet?.name} ({ipSearchResult.subnet?.cidr})
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" /> Subnets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalSubnets}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" /> IP Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalIPs}</p>
          </CardContent>
        </Card>

        {subnetsWithStats.slice(0, 2).map((subnet) => (
          <Card key={subnet.id} className="bg-gradient-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 truncate">
                <Network className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">{subnet.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-primary">
                {subnet.ipAssignments.length} / {subnet.stats.totalIPs} IPs
              </p>
              <p className="text-sm text-muted-foreground">{subnet.cidr}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* IP Table */}
      <Card>
        <CardHeader className="pb-2 bg-gradient-dark">
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" /> Recent IP Assignments
            {searchTerm && <Badge className="ml-2 bg-primary">Filtered</Badge>}
            {selectedSubnet && (
              <Badge
                className="ml-2 bg-primary cursor-pointer hover:bg-primary/80"
                onClick={() => handleSubnetClick(selectedSubnet)}
              >
                Subnet: {selectedSubnet} ×
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px] text-primary/90">IP Address</TableHead>
                  <TableHead className="text-primary/90">Service</TableHead>
                  <TableHead className="hidden md:table-cell text-primary/90">Description</TableHead>
                  <TableHead className="text-primary/90">Subnet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIPs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                      {searchTerm || selectedSubnet ? "No IP assignments match your filters." : "No IP assignments yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIPs.map((ip) => (
                    <TableRow key={ip.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-primary/90">{ip.ip}</TableCell>
                      <TableCell className="font-medium">{ip.service}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {ip.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-normal bg-muted/50 border-border cursor-pointer hover:bg-muted/70"
                          onClick={() => handleSubnetClick(ip.subnetName)}
                        >
                          {ip.subnetName}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

