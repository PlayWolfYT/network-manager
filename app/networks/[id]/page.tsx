"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NetworkDashboard } from "@/components/network-dashboard"
import { SettingsMenu } from "@/components/settings-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { use } from "react"
import { Network, ArrowLeft } from "lucide-react"

interface Network {
    id: string
    name: string
    description: string | null
}

export default function NetworkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [network, setNetwork] = useState<Network | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { addToast } = useToast()

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const response = await fetch(`/api/networks/${id}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch network")
                }
                const data = await response.json()
                setNetwork(data)
            } catch (error) {
                console.error("Error fetching network:", error)
                addToast({
                    title: "Error",
                    description: "Failed to load network details",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchNetwork()
    }, [id, addToast])

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Failed to logout")
            }

            addToast({
                title: "Success",
                description: "Logged out successfully",
                variant: "success",
            })

            router.push("/login")
        } catch (error) {
            console.error("Logout error:", error)
            addToast({
                title: "Error",
                description: "Failed to logout",
                variant: "destructive",
            })
        }
    }

    const handleNetworkUpdated = (updatedNetwork: Network) => {
        setNetwork(updatedNetwork)
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!network) {
        return <div>Network not found</div>
    }

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/networks")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Network className="h-8 w-8 text-primary" />
                            {network.name}
                        </h1>
                        {network.description && (
                            <p className="text-muted-foreground">{network.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <SettingsMenu network={network} onNetworkUpdated={handleNetworkUpdated} />
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
            <NetworkDashboard networkId={id} />
        </div>
    )
} 