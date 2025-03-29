import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.iPAssignment.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting IP assignment:", error)
    return NextResponse.json({ error: "Failed to delete IP assignment" }, { status: 500 })
  }
}

