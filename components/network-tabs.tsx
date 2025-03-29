"use client"

import type { ViewType } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Network, Cpu, Plus, Search } from "lucide-react"

interface NetworkTabsProps {
  activeView: ViewType
  onChange: (view: ViewType) => void
}

export function NetworkTabs({ activeView, onChange }: NetworkTabsProps) {
  return (
    <Tabs value={activeView} onValueChange={(value) => onChange(value as ViewType)} className="w-full mb-6">
      <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto bg-card border border-border">
        <TabsTrigger
          value="dashboard"
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </TabsTrigger>
        <TabsTrigger
          value="subnets"
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Network className="h-4 w-4" />
          <span className="hidden sm:inline">Subnets</span>
        </TabsTrigger>
        <TabsTrigger
          value="create"
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </TabsTrigger>
        <TabsTrigger
          value="ips"
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Cpu className="h-4 w-4" />
          <span className="hidden sm:inline">IP Addresses</span>
        </TabsTrigger>
        <TabsTrigger
          value="assign"
          className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Assign IP</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

