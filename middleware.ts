import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
    const session = await getSession()

    // Public paths that don't require authentication
    const publicPaths = ["/login", "/register"]
    const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    // Redirect to login if accessing protected route without session
    if (!session && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // Redirect to networks if accessing login/register with session
    if (session && isPublicPath) {
        return NextResponse.redirect(new URL("/networks", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
} 