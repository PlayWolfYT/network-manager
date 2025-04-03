import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { ip, service, description, subnetId } = await request.json()

    const ipAssignment = await prisma.iPAssignment.create({
      data: {
        ip,
        service,
        description,
        subnet: {
          connect: {
            id: subnetId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(ipAssignment)
  } catch (error) {
    console.error("Error creating IP assignment:", error)
    return NextResponse.json({ error: "Failed to create IP assignment" }, { status: 500 })
  }
}

