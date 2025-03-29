import prisma from "./prisma"

export async function initializeDatabase() {
  try {
    // Check if we have any settings
    const settingsCount = await prisma.userSettings.count()

    // If no settings exist, create default settings
    if (settingsCount === 0) {
      await prisma.userSettings.create({
        data: {
          id: "settings",
          theme: "blue-dark",
        },
      })
      console.log("Created default settings")
    }

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Failed to initialize database:", error)
  }
}

