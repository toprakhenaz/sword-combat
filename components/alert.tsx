"use client"

import type React from "react"

import type { AlertProps } from "@/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export function Alert({ children, isGreen }: AlertProps) {
  return (
    <div
      className={`${
        isGreen ? "bg-gradient-to-r from-green-600 to-green-700" : "bg-gradient-to-r from-red-600 to-red-700"
      } text-white p-4 rounded-lg shadow-lg border ${isGreen ? "border-green-500" : "border-red-500"}`}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          <FontAwesomeIcon
            icon={isGreen ? icons.check : icons.times}
            className={`${isGreen ? "text-green-300" : "text-red-300"} text-xl`}
          />
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-lg mb-1">{children}</h3>
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm opacity-90">{children}</p>
}
