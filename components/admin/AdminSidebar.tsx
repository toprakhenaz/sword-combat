"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

const adminTabs = [
  { key: "users", label: "Kullanıcılar", href: "/admin/users", icon: icons.userGroup },
  { key: "items", label: "Itemlar", href: "/admin/items", icon: icons.coins },
  { key: "boosts", label: "Boostlar", href: "/admin/boosts", icon: icons.rocket },
  { key: "tasks", label: "Görevler", href: "/admin/tasks", icon: icons.listCheck },
  { key: "daily", label: "Günlük Ödül", href: "/admin/daily", icon: icons.calendar },
  { key: "combo", label: "Combo", href: "/admin/combo", icon: icons.star },
  { key: "referrals", label: "Referanslar", href: "/admin/referrals", icon: icons.userGroup },
  { key: "transactions", label: "İşlemler", href: "/admin/transactions", icon: icons.arrowRight },
  { key: "leagues", label: "Ligler", href: "/admin/leagues", icon: icons.swords },
  { key: "settings", label: "Ayarlar", href: "/admin/settings", icon: icons.filter },
]

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)

  const NavLinks = () => (
    <>
      {adminTabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            pathname === tab.href
              ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold shadow-lg"
              : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
          }`}
          onClick={() => setIsOpen(false)}
        >
          <FontAwesomeIcon
            icon={tab.icon}
            className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
              pathname === tab.href ? "text-black" : "text-gray-400"
            }`}
          />
          <span className="font-medium">{tab.label}</span>
        </Link>
      ))}
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-6 left-6 z-50 p-3 rounded-xl bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700/80 transition-all duration-200 shadow-lg border border-gray-700/50"
      >
        <FontAwesomeIcon icon={isOpen ? icons.times : icons.filter} size="lg" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed left-0 top-0 z-40 h-full w-80 bg-gray-950/95 backdrop-blur-lg border-r border-gray-800/50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-20 px-6 space-y-2">
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <div className="h-1 w-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-2"></div>
          </div>
          <NavLinks />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 h-screen flex-col bg-gray-950/95 backdrop-blur-lg border-r border-gray-800/50 p-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mt-3"></div>
        </div>
        <nav className="space-y-2 flex-1">
          <NavLinks />
        </nav>
        <div className="pt-6 border-t border-gray-800/50">
          <div className="text-xs text-gray-500 text-center">Admin Dashboard v2.0</div>
        </div>
      </aside>
    </>
  )
}
