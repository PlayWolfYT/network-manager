import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    let settings = await prisma.userSettings.findUnique({
      where: {
        id: "settings",
      },
    })

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          id: "settings",
          theme: "blue-dark",
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { theme } = await request.json()

    const settings = await prisma.userSettings.upsert({
      where: {
        id: "settings",
      },
      update: {
        theme,
      },
      create: {
        id: "settings",
        theme,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

