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

        return NextResponse.json(subnet)
    } catch (error) {
        console.error("Error fetching subnet:", error)
        return NextResponse.json({ error: "Failed to fetch subnet" }, { status: 500 })
    }
}

export async function PUT(
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
        const { name, cidr, description } = body

        const updatedSubnet = await prisma.subnet.update({
            where: {
                id: subnetId,
            },
            data: {
                name,
                cidr,
                description,
            },
            include: {
                ipAssignments: true,
            },
        })

        return NextResponse.json(updatedSubnet)
    } catch (error) {
        console.error("Error updating subnet:", error)
        return NextResponse.json({ error: "Failed to update subnet" }, { status: 500 })
    }
}

export async function DELETE(
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

        await prisma.subnet.delete({
            where: {
                id: subnetId,
            },
        })

        return NextResponse.json({ message: "Subnet deleted successfully" })
    } catch (error) {
        console.error("Error deleting subnet:", error)
        return NextResponse.json({ error: "Failed to delete subnet" }, { status: 500 })
    }
} 