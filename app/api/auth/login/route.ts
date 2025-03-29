import { NextResponse } from "next/server"
import { login } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        const { user, token } = await login(email, password)

        // Set the token in an HTTP-only cookie
        const cookieStore = await cookies()
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 24 hours
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to login" },
            { status: 401 }
        )
    }
} 