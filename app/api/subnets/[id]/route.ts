import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const subnet = await prisma.subnet.findUnique({
      where: {
        id: params.id,
      },
      include: {
        ipAssignments: true,
      },
    })

    if (!subnet) {
      return NextResponse.json({ error: "Subnet not found" }, { status: 404 })
    }

    return NextResponse.json(subnet)
  } catch (error) {
    console.error("Error fetching subnet:", error)
    return NextResponse.json({ error: "Failed to fetch subnet" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, cidr, description } = await request.json()

    const subnet = await prisma.subnet.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        cidr,
        description,
      },
    })

    return NextResponse.json(subnet)
  } catch (error) {
    console.error("Error updating subnet:", error)
    return NextResponse.json({ error: "Failed to update subnet" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    await prisma.subnet.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subnet:", error)
    return NextResponse.json({ error: "Failed to delete subnet" }, { status: 500 })
  }
}

