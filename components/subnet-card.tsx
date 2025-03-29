"use client"

import { useState } from "react"
import type { Subnet } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Network, Server, ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { calculateSubnetStats } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface SubnetCardProps {
  subnet: Subnet
  onEdit: (subnet: Subnet) => void
  onDelete: (id: string) => void
  onDeleteIpAssignment: (subnetId: string, ipAssignmentId: string) => void
}

export function SubnetCard({ subnet, onEdit, onDelete, onDeleteIpAssignment }: SubnetCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const stats = calculateSubnetStats(subnet)

  // Ensure ipAssignments is always an array
  const ipAssignments = subnet.ipAssignments || []

  // Show only first 4 IPs by default
  const previewIPs = ipAssignments.slice(0, 4)
  const hasMoreIPs = ipAssignments.length > 4

  return (
    <Card className="overflow-hidden border-border bg-card glow-border">
      <CardHeader className="pb-3 bg-gradient-dark">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Network className="h-5 w-5 text-primary" />
              {subnet.name}
            </CardTitle>
            <Badge variant="outline" className="mt-1 border-border bg-muted/50">
              {subnet.cidr}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(subnet)}
              aria-label={`Edit subnet ${subnet.name}`}
              className="hover:bg-muted/70"
            >
              <Edit className="h-4 w-4 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(subnet.id)}
              aria-label={`Delete subnet ${subnet.name}`}
              className="hover:bg-destructive/20"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        {subnet.description && (
          <CardDescription className="mt-2 text-muted-foreground">{subnet.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IP Usage</span>
            <span className="text-primary">
              {ipAssignments.length} / {stats.totalIPs}
            </span>
          </div>
          <Progress value={stats.usagePercentage} className="h-2 bg-muted" indicatorClassName="bg-primary" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center gap-1 text-primary/90">
              <Server className="h-4 w-4 text-primary" /> IP Assignments
            </h3>
            {ipAssignments.length > 0 && (
              <Badge variant="outline" className="text-xs bg-muted/50 border-border">
                {ipAssignments.length} IPs
              </Badge>
            )}
          </div>

          {ipAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No IP assignments yet.</p>
          ) : (
            <div className="space-y-2">
              {previewIPs.map((ip) => (
                <div
                  key={ip.id}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border"
                >
                  <div className="overflow-hidden">
                    <div className="font-mono text-sm text-primary/90">{ip.ip}</div>
                    <div className="text-sm font-medium truncate">{ip.service}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteIpAssignment(subnet.id, ip.id)}
                    aria-label={`Delete IP assignment ${ip.ip}`}
                    className="h-7 w-7 hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}

              {hasMoreIPs && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-primary hover:bg-muted/50"
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      {isOpen ? (
                        <>
                          <ChevronUp className="h-4 w-4" /> Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" /> Show {ipAssignments.length - 4} More
                        </>
                      )}
                    </Button>
                  </div>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {ipAssignments.slice(4).map((ip) => (
                      <div
                        key={ip.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border"
                      >
                        <div className="overflow-hidden">
                          <div className="font-mono text-sm text-primary/90">{ip.ip}</div>
                          <div className="text-sm font-medium truncate">{ip.service}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteIpAssignment(subnet.id, ip.id)}
                          aria-label={`Delete IP assignment ${ip.ip}`}
                          className="h-7 w-7 hover:bg-destructive/20"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

