import { UserProvider } from "@/contexts/UserContext"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sword Coin",
  description: "Earn coins by tapping and upgrading your equipment",
  generator: "Next.js",
}

// Viewport'u ayrı export olarak tanımla
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // SSR ban kontrolü
  const supabase = createServerComponentClient({ cookies })
  let isBanned = false
  const userId = null

  // Telegram ID veya session'dan userId çek
  // (Burada örnek olarak cookie veya session'dan userId çekiliyor, kendi auth sistemine göre düzenle)
  // const userId = ...

  if (userId) {
    const { data: user } = await supabase.from("users").select("is_banned").eq("id", userId).single()
    if (user?.is_banned) {
      isBanned = true
    }
  }

  if (isBanned) {
    return (
      <html lang="tr">
        <body className="min-h-screen bg-gray-950">
          <div className="min-h-screen flex items-center justify-center bg-gray-950 text-center">
            <div className="bg-gray-900 p-8 rounded-xl shadow-xl border border-gray-800 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Hesabınız Banlandı</h2>
              <p className="text-gray-300 mb-2">Bu hesap yöneticiler tarafından engellenmiştir.</p>
              <p className="text-gray-500 text-sm">Destek için admin ile iletişime geçin.</p>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="tr">
      <head>
        <script async src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className={`${inter.className} telegram-theme ios-safe-area-bottom`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
