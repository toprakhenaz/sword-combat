import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"

const LEAGUES_DIR = join(process.cwd(), "public", "leagues")

export async function POST(req: NextRequest) {
  // Admin auth check
  const auth = req.headers.get("x-admin-auth")
  if (auth !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    // Create directory if it doesn't exist
    if (!existsSync(LEAGUES_DIR)) {
      await mkdir(LEAGUES_DIR, { recursive: true })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
    }

    // Prevent filename collisions
    const ext = file.name.split(".").pop()
    const base = file.name.replace(/\.[^/.]+$/, "")
    const unique = `${base}-${Date.now()}.${ext}`
    const filePath = join(LEAGUES_DIR, unique)

    // Save the file
    const arrayBuffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(arrayBuffer))

    // Return public URL
    const publicUrl = `/leagues/${unique}`
    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error) {
    console.error("Error uploading league image:", error)
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 })
  }
}
