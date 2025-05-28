"use client"
import { useEffect } from "react"
import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("admin_auth") === "1"
      if (!isAuth && !pathname?.startsWith("/admin/login")) {
        router.replace("/admin/login")
      }
    }
  }, [pathname, router])

  // Login sayfasında farklı layout kullan
  if (pathname?.startsWith("/admin/login")) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex">
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <AdminSidebar />
      </div>
      <main className="flex-1 md:ml-72 min-h-screen overflow-x-auto">
        <div className="p-6 md:p-8 pt-24 md:pt-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
