"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Moon, Sun, Monitor, Palette, Edit } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { EditNetworkDialog } from "@/components/edit-network-dialog"

interface Network {
    id: string
    name: string
    description: string | null
}

interface SettingsMenuProps {
    network?: Network
    onNetworkUpdated?: (updatedNetwork: Network) => void
}

const colorSchemes = [
    {
        name: "Purple",
        value: "purple",
        description: "Modern purple theme with vibrant accents",
    },
    {
        name: "Blue",
        value: "blue",
        description: "Classic blue theme with professional look",
    },
    {
        name: "Emerald",
        value: "emerald",
        description: "Fresh emerald theme with natural feel",
    },
    {
        name: "Rose",
        value: "rose",
        description: "Warm rose theme with energetic vibe",
    },
]

export function SettingsMenu({ network, onNetworkUpdated }: SettingsMenuProps) {
    const { setTheme, theme } = useTheme()
    const [selectedScheme, setSelectedScheme] = useState("purple")
    const [isOpen, setIsOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    useEffect(() => {
        // Load saved theme from localStorage
        const savedScheme = localStorage.getItem("colorScheme") || "purple"
        setSelectedScheme(savedScheme)
        document.documentElement.setAttribute("data-theme", savedScheme)
    }, [])

    const handleSchemeChange = (value: string) => {
        setSelectedScheme(value)
        document.documentElement.setAttribute("data-theme", value)
        localStorage.setItem("colorScheme", value)
    }

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "hover:bg-opacity-30",
                            `bg-${selectedScheme}-950 hover:bg-${selectedScheme}-900`
                        )}
                    >
                        <Settings className={`h-5 w-5 text-${selectedScheme}-400`} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {network && (
                        <>
                            <DropdownMenuLabel>Network</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Network
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor className="mr-2 h-4 w-4" />
                        System
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
                    {colorSchemes.map((scheme) => (
                        <DropdownMenuItem
                            key={scheme.value}
                            onClick={() => handleSchemeChange(scheme.value)}
                            className={cn(
                                "flex flex-col items-start gap-1",
                                selectedScheme === scheme.value && "bg-accent"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Palette className={`h-4 w-4 text-${scheme.value}-400`} />
                                <span>{scheme.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{scheme.description}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {network && (
                <EditNetworkDialog
                    network={network}
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onNetworkUpdated={onNetworkUpdated || (() => { })}
                />
            )}
        </>
    )
} 