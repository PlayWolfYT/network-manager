import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
                        ipAssignments: {
                            orderBy: {
                                createdAt: "desc",
                            }
                        },
                    },
                },
            },
        })

        if (!network) {
            return NextResponse.json({ error: "Network not found" }, { status: 404 })
        }

        return NextResponse.json(network.subnets)
    } catch (error) {
        console.error("Error fetching subnets:", error)
        return NextResponse.json({ error: "Failed to fetch subnets" }, { status: 500 })
    }
}

export async function POST(
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

        const body = await request.json()
        const { name, cidr, description } = body

        const subnet = await prisma.subnet.create({
            data: {
                name,
                cidr,
                description,
                networkId: id,
            },
            include: {
                ipAssignments: true,
            },
        })

        return NextResponse.json(subnet)
    } catch (error) {
        console.error("Error creating subnet:", error)
        return NextResponse.json({ error: "Failed to create subnet" }, { status: 500 })
    }
} 