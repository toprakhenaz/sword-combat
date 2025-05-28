import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { writeFile } from "fs/promises"

const EQUIPMENT_DIR = join(process.cwd(), "public", "equipment")

export async function POST(req: NextRequest) {
  // Basit admin auth kontrolü (localStorage ile değil, header ile yapılmalı)
  const auth = req.headers.get("x-admin-auth")
  if (auth !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File
  if (!file) {
    return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
  }

  // Dosya adı çakışmasını önle
  const ext = file.name.split(".").pop()
  const base = file.name.replace(/\.[^/.]+$/, "")
  const unique = `${base}-${Date.now()}.${ext}`
  const filePath = join(EQUIPMENT_DIR, unique)

  // Dosyayı kaydet
  const arrayBuffer = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(arrayBuffer))

  // Public URL döndür
  const publicUrl = `/equipment/${unique}`
  return NextResponse.json({ success: true, url: publicUrl })
}
