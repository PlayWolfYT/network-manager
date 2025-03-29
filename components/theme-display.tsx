"use client"

import { useEffect, useState } from "react"

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

export function ThemeDisplay() {
  const [currentTheme, setCurrentTheme] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch the current theme from the API
    const fetchTheme = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setCurrentTheme(data.theme)
        }
      } catch (error) {
        console.error("Failed to fetch theme:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTheme()
  }, [])

  if (isLoading || !currentTheme) {
    return null
  }

  const theme = themes.find((t) => t.name === currentTheme)
  if (!theme) return null

  return (
    <div className="text-sm text-muted-foreground">
      Theme: <span className="font-medium text-primary">{theme.label}</span>
    </div>
  )
}

