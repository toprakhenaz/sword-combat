"use client"

import { icons } from "@/icons"
import type { ModalProps } from "@/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={icons.times} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
