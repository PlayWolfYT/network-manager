import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const subnets = await prisma.subnet.findMany({
      include: {
        ipAssignments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
    return NextResponse.json(subnets)
  } catch (error) {
    console.error("Error fetching subnets:", error)
    return NextResponse.json({ error: "Failed to fetch subnets" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, cidr, description } = await request.json()

    const subnet = await prisma.subnet.create({
      data: {
        name,
        cidr,
        description,
      },
    })

    return NextResponse.json(subnet)
  } catch (error) {
    console.error("Error creating subnet:", error)
    return NextResponse.json({ error: "Failed to create subnet" }, { status: 500 })
  }
}

