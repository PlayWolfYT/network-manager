import { NextResponse } from "next/server"
import { register } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json()

        const { user, token } = await register(email, password, name)

        // Set the token in an HTTP-only cookie
        cookies().set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to register" },
            { status: 400 }
        )
    }
} 