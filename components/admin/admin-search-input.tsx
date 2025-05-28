"use client"
import type React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface AdminSearchInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

export default function AdminSearchInput({
  value,
  onChange,
  placeholder = "Ara...",
  className = "",
}: AdminSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <FontAwesomeIcon icon={icons.search} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200 backdrop-blur-sm"
      />
    </div>
  )
}
