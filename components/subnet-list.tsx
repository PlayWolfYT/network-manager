"use client"

import type { Subnet, IPAssignment } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IPAssignmentForm } from "@/components/ip-assignment-form"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Server, ChevronDown, ChevronUp } from "lucide-react"
import { IPAssignmentList } from "@/components/ip-assignment-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SubnetListProps {
  subnets: Subnet[]
  onEdit: (subnet: Subnet) => void
  onDelete: (id: string) => void
  onAddIpAssignment: (subnetId: string, ipAssignment: IPAssignment) => void
  onDeleteIpAssignment: (subnetId: string, ipAssignmentId: string) => void
}

export function SubnetList({ subnets, onEdit, onDelete, onAddIpAssignment, onDeleteIpAssignment }: SubnetListProps) {
  const [addingIpToSubnet, setAddingIpToSubnet] = useState<string | null>(null)
  const [openSubnets, setOpenSubnets] = useState<Record<string, boolean>>({})

  const toggleSubnet = (id: string) => {
    setOpenSubnets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (subnets.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No subnets have been added yet. Click the "Add Subnet" button to create your first subnet.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {subnets.map((subnet) => (
        <Card key={subnet.id} className="overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  {subnet.name}
                </CardTitle>
                <Badge variant="outline" className="mt-1">
                  {subnet.cidr}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(subnet)}
                  aria-label={`Edit subnet ${subnet.name}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(subnet.id)}
                  aria-label={`Delete subnet ${subnet.name}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            {subnet.description && <CardDescription className="mt-2">{subnet.description}</CardDescription>}
          </CardHeader>
          <Collapsible open={openSubnets[subnet.id]}>
            <div className="flex justify-end px-6 py-1 border-t">
              <CollapsibleTrigger
                onClick={() => toggleSubnet(subnet.id)}
                className="rounded-md h-8 w-8 inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground"
              >
                {openSubnets[subnet.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <CardContent>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Server className="h-4 w-4 mr-1" /> IP Assignments
                </h3>
                <IPAssignmentList
                  ipAssignments={subnet.ipAssignments}
                  onDelete={(ipId) => onDeleteIpAssignment(subnet.id, ipId)}
                />
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                {addingIpToSubnet === subnet.id ? (
                  <IPAssignmentForm
                    onSubmit={(ipAssignment) => {
                      onAddIpAssignment(subnet.id, ipAssignment)
                      setAddingIpToSubnet(null)
                    }}
                    onCancel={() => setAddingIpToSubnet(null)}
                    subnetCidr={subnet.cidr}
                  />
                ) : (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setAddingIpToSubnet(subnet.id)}>
                    <Plus className="h-4 w-4 mr-2" /> Add IP Assignment
                  </Button>
                )}
              </CardFooter>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  )
}

