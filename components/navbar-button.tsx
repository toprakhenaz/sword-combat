"use client"

import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"

function NavbarButton({
  href,
  icon,
  label,
  active,
  activeColor = "#6D7B8D",
}: {
  href: string
  icon: IconDefinition
  label: string
  active: boolean
  activeColor?: string
}) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center py-1">
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-xl mb-1 transition-all duration-300 ${
            active ? "bg-[#252A3C]" : "bg-transparent"
          }`}
        >
          <FontAwesomeIcon
            icon={icon}
            className={`text-xl transition-colors duration-300 ${active ? "" : "text-gray-400"}`}
            style={{ color: active ? activeColor : undefined, transition: "color 0.5s ease" }}
          />
        </div>
        <span className={`text-xs transition-colors duration-300 ${active ? "text-white" : "text-gray-400"}`}>
          {label}
        </span>
      </div>
    </Link>
  )
}

export default NavbarButton
