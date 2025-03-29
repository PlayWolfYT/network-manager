import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; subnetId: string; ipAssignmentId: string } }
) {
    try {
        const session = await requireAuth(request)
        const [networkId, subnetId, ipAssignmentId] = await Promise.all([
            Promise.resolve(params.id),
            Promise.resolve(params.subnetId),
            Promise.resolve(params.ipAssignmentId),
        ])

        const network = await prisma.network.findFirst({
            where: {
                id: networkId,
                userId: session.id,
            },
            include: {
                subnets: {
                    where: {
                        id: subnetId,
                    },
                    include: {
                        ipAssignments: {
                            where: {
                                id: ipAssignmentId,
                            },
                        },
                    },
                },
            },
        })

        if (!network) {
            return NextResponse.json({ error: "Network not found" }, { status: 404 })
        }

        const subnet = network.subnets[0]
        if (!subnet) {
            return NextResponse.json({ error: "Subnet not found" }, { status: 404 })
        }

        const ipAssignment = subnet.ipAssignments[0]
        if (!ipAssignment) {
            return NextResponse.json({ error: "IP assignment not found" }, { status: 404 })
        }

        return NextResponse.json(ipAssignment)
    } catch (error) {
        console.error("Error fetching IP assignment:", error)
        return NextResponse.json({ error: "Failed to fetch IP assignment" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; subnetId: string; ipAssignmentId: string } }
) {
    try {
        const session = await requireAuth(request)
        const [networkId, subnetId, ipAssignmentId] = await Promise.all([
            Promise.resolve(params.id),
            Promise.resolve(params.subnetId),
            Promise.resolve(params.ipAssignmentId),
        ])

        const network = await prisma.network.findFirst({
            where: {
                id: networkId,
                userId: session.id,
            },
            include: {
                subnets: {
                    where: {
                        id: subnetId,
                    },
                    include: {
                        ipAssignments: {
                            where: {
                                id: ipAssignmentId,
                            },
                        },
                    },
                },
            },
        })

        if (!network) {
            return NextResponse.json({ error: "Network not found" }, { status: 404 })
        }

        const subnet = network.subnets[0]
        if (!subnet) {
            return NextResponse.json({ error: "Subnet not found" }, { status: 404 })
        }

        const ipAssignment = subnet.ipAssignments[0]
        if (!ipAssignment) {
            return NextResponse.json({ error: "IP assignment not found" }, { status: 404 })
        }

        await prisma.iPAssignment.delete({
            where: {
                id: ipAssignmentId,
            },
        })

        return NextResponse.json({ message: "IP assignment deleted successfully" })
    } catch (error) {
        console.error("Error deleting IP assignment:", error)
        return NextResponse.json({ error: "Failed to delete IP assignment" }, { status: 500 })
    }
} 