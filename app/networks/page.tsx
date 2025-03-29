"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { Network, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Network {
    id: string
    name: string
    description?: string
    createdAt: string
}

export default function NetworksPage() {
    const [networks, setNetworks] = useState<Network[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newNetworkName, setNewNetworkName] = useState("")
    const [newNetworkDescription, setNewNetworkDescription] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()
    const { addToast } = useToast()

    useEffect(() => {
        fetchNetworks()
    }, [])

    const fetchNetworks = async () => {
        try {
            const response = await fetch("/api/networks")
            if (!response.ok) {
                throw new Error("Failed to fetch networks")
            }
            const data = await response.json()
            setNetworks(data)
        } catch (error) {
            console.error("Error fetching networks:", error)
            addToast({
                title: "Error",
                description: "Failed to load networks",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateNetwork = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        try {
            const response = await fetch("/api/networks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newNetworkName,
                    description: newNetworkDescription,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create network")
            }

            const newNetwork = await response.json()
            setNetworks([...networks, newNetwork])
            setNewNetworkName("")
            setNewNetworkDescription("")
            setIsCreating(false)

            addToast({
                title: "Success",
                description: "Network created successfully",
                variant: "success",
            })
        } catch (error) {
            console.error("Error creating network:", error)
            addToast({
                title: "Error",
                description: "Failed to create network",
                variant: "destructive",
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            router.push("/login")
        } catch (error) {
            console.error("Error logging out:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="container flex h-screen w-screen flex-col items-center justify-center">
                <p>Loading networks...</p>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your Networks</h1>
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {networks.map((network) => (
                    <Card
                        key={network.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/networks/${network.id}`)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5 text-primary" />
                                {network.name}
                            </CardTitle>
                            {network.description && (
                                <CardDescription>{network.description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Created {new Date(network.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                <Dialog>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                                    <Plus className="h-5 w-5" />
                                    Create New Network
                                </CardTitle>
                                <CardDescription>Add a new network to manage</CardDescription>
                            </CardHeader>
                        </Card>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreateNetwork}>
                            <DialogHeader>
                                <DialogTitle>Create New Network</DialogTitle>
                                <DialogDescription>
                                    Add a new network to manage your subnets and IP assignments.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Network Name</Label>
                                    <Input
                                        id="name"
                                        value={newNetworkName}
                                        onChange={(e) => setNewNetworkName(e.target.value)}
                                        placeholder="Enter network name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={newNetworkDescription}
                                        onChange={(e) => setNewNetworkDescription(e.target.value)}
                                        placeholder="Enter network description"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? "Creating..." : "Create Network"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
} 