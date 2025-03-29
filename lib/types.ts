export interface IPAssignment {
  id: string
  ip: string
  service: string
  description?: string
  subnetId: string // Reference to parent subnet
}

export interface Subnet {
  id: string
  name: string
  cidr: string
  description?: string
  ipAssignments: IPAssignment[]
}

export type ViewType = "dashboard" | "subnets" | "ips" | "assign" | "create"

