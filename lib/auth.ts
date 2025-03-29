import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY || "your-secret-key")
const key = { kty: "oct", k: secretKey }

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key.k)
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key.k, {
        algorithms: ["HS256"],
    })
    return payload
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export async function getSession() {
    const token = (await cookies()).get("token")?.value
    if (!token) return null
    try {
        const payload = await decrypt(token)
        return payload
    } catch (error) {
        return null
    }
}

export async function requireAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value
    if (!token) {
        throw new Error("Unauthorized")
    }
    try {
        const payload = await decrypt(token)
        return payload
    } catch (error) {
        throw new Error("Unauthorized")
    }
}

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            networks: true,
            settings: true,
        },
    })

    if (!user) {
        throw new Error("Invalid credentials")
    }

    const isValid = await comparePasswords(password, user.password)
    if (!isValid) {
        throw new Error("Invalid credentials")
    }

    const token = await encrypt({
        id: user.id,
        email: user.email,
        name: user.name,
    })

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            networks: user.networks,
            settings: user.settings,
        },
        token,
    }
}

export async function register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        throw new Error("User already exists")
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            settings: {
                create: {},
            },
        },
        include: {
            networks: true,
            settings: true,
        },
    })

    const token = await encrypt({
        id: user.id,
        email: user.email,
        name: user.name,
    })

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            networks: user.networks,
            settings: user.settings,
        },
        token,
    }
} 