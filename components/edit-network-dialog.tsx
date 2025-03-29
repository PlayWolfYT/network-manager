"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"

interface Network {
    id: string
    name: string
    description: string | null
}

interface EditNetworkDialogProps {
    network: Network
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onNetworkUpdated: (updatedNetwork: Network) => void
}

export function EditNetworkDialog({
    network,
    isOpen,
    onOpenChange,
    onNetworkUpdated,
}: EditNetworkDialogProps) {
    const [name, setName] = useState(network.name)
    const [description, setDescription] = useState(network.description || "")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { addToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/networks/${network.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description: description || null,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update network")
            }

            const updatedNetwork = await response.json()
            onNetworkUpdated(updatedNetwork)
            onOpenChange(false)

            addToast({
                title: "Success",
                description: "Network updated successfully",
                variant: "success",
            })
        } catch (error) {
            console.error("Error updating network:", error)
            addToast({
                title: "Error",
                description: "Failed to update network",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Network</DialogTitle>
                        <DialogDescription>
                            Update the network name and description.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Network Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter network name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter network description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Network"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
} 