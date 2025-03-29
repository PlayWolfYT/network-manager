import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Subnet, IPAssignment } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Validate CIDR notation (e.g., 192.168.1.0/24)
export function validateCIDR(cidr: string): boolean {
  const cidrPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/
  if (!cidrPattern.test(cidr)) {
    return false
  }

  // Validate IP part
  const ipPart = cidr.split("/")[0]
  const octets = ipPart.split(".")

  for (const octet of octets) {
    const num = Number.parseInt(octet, 10)
    if (num < 0 || num > 255) {
      return false
    }
  }

  return true
}

// Check if an IP is within a subnet
export function isIPInSubnet(ip: string, cidr: string): boolean {
  try {
    // Simple validation for IP format
    const ipPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
    if (!ipPattern.test(ip)) {
      return false
    }

    // For a more accurate check, we would need to convert IPs to binary and check subnet masks
    // This is a simplified version that just checks the network part matches
    const ipParts = ip.split(".")
    const cidrParts = cidr.split("/")[0].split(".")
    const mask = Number.parseInt(cidr.split("/")[1], 10)

    // Calculate how many full octets are covered by the mask
    const fullOctets = Math.floor(mask / 8)

    // Check full octets match
    for (let i = 0; i < fullOctets; i++) {
      if (ipParts[i] !== cidrParts[i]) {
        return false
      }
    }

    // If mask is not on an octet boundary, check the partial octet
    if (mask % 8 !== 0) {
      const partialOctetIndex = fullOctets
      const bitsToCheck = mask % 8
      const ipOctet = Number.parseInt(ipParts[partialOctetIndex], 10)
      const cidrOctet = Number.parseInt(cidrParts[partialOctetIndex], 10)

      // Create a mask for the bits we care about
      const bitMask = 256 - Math.pow(2, 8 - bitsToCheck)

      if ((ipOctet & bitMask) !== (cidrOctet & bitMask)) {
        return false
      }
    }

    return true
  } catch (e) {
    console.error("Error checking IP in subnet", e)
    return false
  }
}

// Check if an IP is within a range (inclusive)
export function isIPInRange(ip: string, startIp: string, endIp: string): boolean {
  try {
    // Convert IPs to numeric values for comparison
    const ipValue = ipToNumber(ip)
    const startValue = ipToNumber(startIp)
    const endValue = ipToNumber(endIp)

    return ipValue >= startValue && ipValue <= endValue
  } catch (e) {
    console.error("Error checking IP in range", e)
    return false
  }
}

// Convert IP to numeric value
function ipToNumber(ip: string): number {
  const parts = ip.split(".")
  return (
    ((Number.parseInt(parts[0], 10) << 24) |
      (Number.parseInt(parts[1], 10) << 16) |
      (Number.parseInt(parts[2], 10) << 8) |
      Number.parseInt(parts[3], 10)) >>>
    0
  )
}

// Check if two subnets overlap
export function doSubnetsOverlap(cidr1: string, cidr2: string): boolean {
  try {
    // Calculate the network and broadcast addresses for both subnets
    const subnet1 = calculateSubnetRange(cidr1)
    const subnet2 = calculateSubnetRange(cidr2)

    // Check if one subnet's start address is within the other subnet's range
    // or if one subnet's end address is within the other subnet's range
    return (
      isIPInRange(subnet1.firstIP, subnet2.firstIP, subnet2.lastIP) ||
      isIPInRange(subnet1.lastIP, subnet2.firstIP, subnet2.lastIP) ||
      isIPInRange(subnet2.firstIP, subnet1.firstIP, subnet1.lastIP) ||
      isIPInRange(subnet2.lastIP, subnet1.firstIP, subnet1.lastIP)
    )
  } catch (e) {
    console.error("Error checking subnet overlap", e)
    return false
  }
}

// Calculate subnet range from CIDR
export function calculateSubnetRange(cidr: string) {
  const cidrParts = cidr.split("/")
  const ipPart = cidrParts[0]
  const maskBits = Number.parseInt(cidrParts[1], 10)

  // Calculate network address (first IP) and broadcast address (last IP)
  const ipOctets = ipPart.split(".").map((octet) => Number.parseInt(octet, 10))
  const networkAddress = [...ipOctets]
  const broadcastAddress = [...ipOctets]

  for (let i = 0; i < 4; i++) {
    const octetPosition = i * 8
    if (maskBits <= octetPosition) {
      // This octet is not covered by the mask at all
      broadcastAddress[i] = 255
      networkAddress[i] = 0
    } else if (maskBits < octetPosition + 8) {
      // This octet is partially covered by the mask
      const hostBits = octetPosition + 8 - maskBits
      const hostPart = Math.pow(2, hostBits) - 1
      broadcastAddress[i] = networkAddress[i] | hostPart
      networkAddress[i] = networkAddress[i] & ~hostPart
    }
    // If maskBits >= octetPosition + 8, the octet is fully covered by the mask
  }

  return {
    firstIP: networkAddress.join("."),
    lastIP: broadcastAddress.join("."),
  }
}

// Find overlapping subnet
export function findOverlappingSubnet(cidr: string, subnets: Subnet[], excludeId?: string): Subnet | null {
  for (const subnet of subnets) {
    // Skip the subnet being edited
    if (excludeId && subnet.id === excludeId) {
      continue
    }

    if (doSubnetsOverlap(cidr, subnet.cidr)) {
      return subnet
    }
  }
  return null
}

// Calculate subnet statistics
export function calculateSubnetStats(subnet: Subnet) {
  try {
    const range = calculateSubnetRange(subnet.cidr)
    const maskBits = Number.parseInt(subnet.cidr.split("/")[1], 10)

    // Calculate total IPs in the subnet
    const totalIPs = Math.pow(2, 32 - maskBits)

    // Calculate usage percentage
    const usagePercentage = Math.round(((subnet.ipAssignments?.length || 0) / totalIPs) * 100 * 100) / 100

    return {
      totalIPs,
      firstIP: range.firstIP,
      lastIP: range.lastIP,
      usagePercentage,
    }
  } catch (e) {
    console.error("Error calculating subnet stats", e)
    return {
      totalIPs: 0,
      firstIP: subnet.cidr.split("/")[0],
      lastIP: subnet.cidr.split("/")[0],
      usagePercentage: 0,
    }
  }
}

// Find duplicate IP across all subnets
export function findDuplicateIP(ip: string, subnets: Subnet[], excludeId?: string): (IPAssignment & { subnetName: string }) | null {
  for (const subnet of subnets) {
    const duplicate = (subnet.ipAssignments || []).find((assignment) =>
      assignment.ip === ip && (!excludeId || assignment.id !== excludeId)
    )
    if (duplicate) {
      return {
        ...duplicate,
        subnetName: subnet.name,
      }
    }
  }
  return null
}

// Check if an IP address is complete (has all 4 octets)
export function isCompleteIPAddress(ip: string): boolean {
  const ipPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
  return ipPattern.test(ip)
}

// Find which subnet an IP belongs to (even with partial IP)
export function findSubnetForIP(
  ip: string,
  subnets: Subnet[],
): {
  subnet: Subnet | null
  isComplete: boolean
  isAssigned: boolean
  assignment: IPAssignment | null
} {
  const isComplete = isCompleteIPAddress(ip)

  // For partial IPs, try to match the subnet based on the available octets
  const parts = ip.split(".")

  for (const subnet of subnets) {
    // For complete IPs, check if it's in the subnet range
    if (isComplete) {
      const stats = calculateSubnetStats(subnet)
      if (isIPInRange(ip, stats.firstIP, stats.lastIP)) {
        // Check if this IP is assigned
        const assignment = (subnet.ipAssignments || []).find((a) => a.ip === ip)
        return {
          subnet,
          isComplete: true,
          isAssigned: !!assignment,
          assignment: assignment || null,
        }
      }
    } else {
      // For partial IPs, match based on available octets
      const subnetParts = subnet.cidr.split("/")[0].split(".")
      let matches = true

      // Compare the available octets
      for (let i = 0; i < parts.length; i++) {
        if (i < subnetParts.length && parts[i] !== subnetParts[i]) {
          // Check if this octet is covered by the subnet mask
          const maskBits = Number.parseInt(subnet.cidr.split("/")[1], 10)
          const octetPosition = i * 8

          if (maskBits > octetPosition) {
            // This octet is fully or partially covered by the mask
            if (maskBits >= octetPosition + 8) {
              // Fully covered, must match exactly
              if (parts[i] !== subnetParts[i]) {
                matches = false
                break
              }
            } else {
              // Partially covered, check the network part
              const bitsToCheck = maskBits - octetPosition
              const partOctet = Number.parseInt(parts[i], 10)
              const subnetOctet = Number.parseInt(subnetParts[i], 10)

              // Create a mask for the bits we care about
              const bitMask = 256 - Math.pow(2, 8 - bitsToCheck)

              if ((partOctet & bitMask) !== (subnetOctet & bitMask)) {
                matches = false
                break
              }
            }
          }
        }
      }

      if (matches) {
        return {
          subnet,
          isComplete: false,
          isAssigned: false,
          assignment: null,
        }
      }
    }
  }

  return { subnet: null, isComplete, isAssigned: false, assignment: null }
}

export function getThemeColor(scheme: string, shade: string): string {
  const colors = {
    purple: {
      "50": "from-purple-50",
      "100": "from-purple-100",
      "200": "from-purple-200",
      "300": "from-purple-300",
      "400": "from-purple-400",
      "500": "from-purple-500",
      "600": "from-purple-600",
      "700": "from-purple-700",
      "800": "from-purple-800",
      "900": "from-purple-900",
      "950": "from-purple-950",
    },
    blue: {
      "50": "from-blue-50",
      "100": "from-blue-100",
      "200": "from-blue-200",
      "300": "from-blue-300",
      "400": "from-blue-400",
      "500": "from-blue-500",
      "600": "from-blue-600",
      "700": "from-blue-700",
      "800": "from-blue-800",
      "900": "from-blue-900",
      "950": "from-blue-950",
    },
    emerald: {
      "50": "from-emerald-50",
      "100": "from-emerald-100",
      "200": "from-emerald-200",
      "300": "from-emerald-300",
      "400": "from-emerald-400",
      "500": "from-emerald-500",
      "600": "from-emerald-600",
      "700": "from-emerald-700",
      "800": "from-emerald-800",
      "900": "from-emerald-900",
      "950": "from-emerald-950",
    },
    rose: {
      "50": "from-rose-50",
      "100": "from-rose-100",
      "200": "from-rose-200",
      "300": "from-rose-300",
      "400": "from-rose-400",
      "500": "from-rose-500",
      "600": "from-rose-600",
      "700": "from-rose-700",
      "800": "from-rose-800",
      "900": "from-rose-900",
      "950": "from-rose-950",
    },
  }

  return colors[scheme as keyof typeof colors]?.[shade as keyof typeof colors["purple"]] || "from-purple-400"
}

