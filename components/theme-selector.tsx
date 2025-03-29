"use client"

import { useEffect, useState } from "react"
import { Check, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/toast"

type Theme = {
  name: string
  value: string
  label: string
  isDark: boolean
}

const themes: Theme[] = [
  { name: "blue-dark", value: "theme-blue-dark", label: "Blue Dark", isDark: true },
  { name: "blue-light", value: "theme-blue-light", label: "Blue Light", isDark: false },
  { name: "green-dark", value: "theme-green-dark", label: "Green Dark", isDark: true },
  { name: "green-light", value: "theme-green-light", label: "Green Light", isDark: false },
  { name: "purple-dark", value: "theme-purple-dark", label: "Purple Dark", isDark: true },
  { name: "purple-light", value: "theme-purple-light", label: "Purple Light", isDark: false },
  { name: "amber-dark", value: "theme-amber-dark", label: "Amber Dark", isDark: true },
  { name: "amber-light", value: "theme-amber-light", label: "Amber Light", isDark: false },
]

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<string>("blue-dark")
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    // Fetch the current theme from the API
    const fetchTheme = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setCurrentTheme(data.theme)
          applyTheme(data.theme)
        }
      } catch (error) {
        console.error("Failed to fetch theme:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTheme()
  }, [])

  const applyTheme = (themeName: string) => {
    const theme = themes.find((t) => t.name === themeName)
    if (!theme) return

    // Remove all theme classes
    document.documentElement.classList.remove(...themes.map((t) => t.value))

    // Add the selected theme class
    document.documentElement.classList.add(theme.value)

    // Set dark mode class
    if (theme.isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const changeTheme = async (themeName: string) => {
    try {
      setCurrentTheme(themeName)
      applyTheme(themeName)

      // Save the theme to the API
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: themeName }),
      })

      if (response.ok) {
        addToast({
          title: "Theme Changed",
          description: `Theme has been updated to ${themes.find((t) => t.name === themeName)?.label}`,
          variant: "success",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Failed to save theme:", error)
      addToast({
        title: "Error",
        description: "Failed to save theme setting",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => changeTheme(theme.name)}
            className="flex items-center gap-2"
          >
            <div className={`h-5 w-5 rounded-full border flex items-center justify-center overflow-hidden`}>
              <div className={`h-full w-full ${theme.value} flex items-center justify-center`}>
                {currentTheme === theme.name && <Check className="h-3 w-3 text-primary" />}
              </div>
            </div>
            {theme.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

