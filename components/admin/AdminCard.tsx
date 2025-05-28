import type React from "react"

interface AdminCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export default function AdminCard({ children, className = "", title, description }: AdminCardProps) {
  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
