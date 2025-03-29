import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function GET(request: Request) {
    try {
        const session = await requireAuth(request)
        const networks = await prisma.network.findMany({
            where: {
                userId: session.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        })
        return NextResponse.json(networks)
    } catch (error) {
        console.error("Error fetching networks:", error)
        return NextResponse.json({ error: "Failed to fetch networks" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await requireAuth(request)
        const { name, description } = await request.json()

        const network = await prisma.network.create({
            data: {
                name,
                description,
                userId: session.id,
            },
        })

        return NextResponse.json(network)
    } catch (error) {
        console.error("Error creating network:", error)
        return NextResponse.json({ error: "Failed to create network" }, { status: 500 })
    }
} 