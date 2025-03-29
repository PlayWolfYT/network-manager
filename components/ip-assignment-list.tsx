"use client"

import type { IPAssignment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface IPAssignmentListProps {
  ipAssignments: IPAssignment[]
  onDelete: (id: string) => void
}

export function IPAssignmentList({ ipAssignments, onDelete }: IPAssignmentListProps) {
  if (ipAssignments.length === 0) {
    return <p className="text-sm text-muted-foreground">No IP assignments yet.</p>
  }

  return (
    <div className="space-y-2">
      {ipAssignments.map((ip) => (
        <div key={ip.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border">
          <div className="overflow-hidden">
            <div className="font-mono text-sm text-primary/90">{ip.ip}</div>
            <div className="text-sm font-medium truncate">{ip.service}</div>
            {ip.description && <div className="text-xs text-muted-foreground truncate">{ip.description}</div>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(ip.id)}
            aria-label={`Delete IP assignment ${ip.ip}`}
            className="hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  )
}

