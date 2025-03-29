import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth(request)
        const { id } = await params

        const network = await prisma.network.findFirst({
            where: {
                id,
                userId: session.id,
            },
            include: {
                subnets: {
                    include: {
                        ipAssignments: true,
                    },
                },
            },
        })

        if (!network) {
            return NextResponse.json({ error: "Network not found" }, { status: 404 })
        }

        return NextResponse.json(network)
    } catch (error) {
        console.error("Error fetching network:", error)
        return NextResponse.json({ error: "Failed to fetch network" }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth(request)
        const { id } = await params

        const network = await prisma.network.findFirst({
            where: {
                id,
                userId: session.id,
            },
        })

        if (!network) {
            return NextResponse.json({ error: "Network not found" }, { status: 404 })
        }

        const { name, description } = await request.json()

        const updatedNetwork = await prisma.network.update({
            where: {
                id,
            },
            data: {
                name,
                description,
            },
        })

        return NextResponse.json(updatedNetwork)
    } catch (error) {
        console.error("Error updating network:", error)
        return NextResponse.json({ error: "Failed to update network" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth(request)
        const { id } = await params

        const network = await prisma.network.findFirst({
            where: {
                id,
                userId: session.id,
            },
        })

        if (!network) {
            return NextResponse.json({ error: "Network not found" }, { status: 404 })
        }

        await prisma.network.delete({
            where: {
                id,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting network:", error)
        return NextResponse.json({ error: "Failed to delete network" }, { status: 500 })
    }
} 