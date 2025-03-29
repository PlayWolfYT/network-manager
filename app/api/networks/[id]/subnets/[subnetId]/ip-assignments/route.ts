import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; subnetId: string } }
) {
    try {
        const session = await requireAuth(request)
        const { id, subnetId } = await params

        const network = await prisma.network.findFirst({
            where: {
                id,
                userId: session.id,
            },
            include: {
                subnets: {
                    where: {
                        id: subnetId,
                    },
                    include: {
                        ipAssignments: true,
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

        return NextResponse.json(subnet.ipAssignments)
    } catch (error) {
        console.error("Error fetching IP assignments:", error)
        return NextResponse.json({ error: "Failed to fetch IP assignments" }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string; subnetId: string } }
) {
    try {
        const session = await requireAuth(request)
        const { id, subnetId } = await params

        const network = await prisma.network.findFirst({
            where: {
                id,
                userId: session.id,
            },
            include: {
                subnets: {
                    where: {
                        id: subnetId,
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

        const body = await request.json()
        const { ip, service, description } = body

        const ipAssignment = await prisma.iPAssignment.create({
            data: {
                ip,
                service,
                description,
                subnetId,
            },
        })

        return NextResponse.json(ipAssignment)
    } catch (error) {
        console.error("Error creating IP assignment:", error)
        return NextResponse.json({ error: "Failed to create IP assignment" }, { status: 500 })
    }
} 