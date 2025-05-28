"use client"

import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import EquipmentCard from "./equipment-card"

interface Equipment {
  id: number
  name: string
  image: string
  level: number
  hourlyIncome: number
  upgradeCost: number
  description: string
  category: string
  userItemId?: string
}

interface EquipmentCollectionProps {
  items: Equipment[]
  selectedItemId: number | null
  onSelectItem: (id: number) => void
  title?: string
  isLoading?: boolean
}

export default function EquipmentCollection({
  items,
  selectedItemId,
  onSelectItem,
  title = "Ekipman Koleksiyonu",
  isLoading = false,
}: EquipmentCollectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<"level" | "income">("level")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [filteredItems, setFilteredItems] = useState<Equipment[]>(items)
  const collectionRef = useRef<HTMLDivElement>(null)

  // Filter and sort items when dependencies change
  useEffect(() => {
    let result = [...items]

    // Apply search filter
    if (searchTerm) {
      result = result.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      if (sortOption === "level") {
        comparison = a.level - b.level
      } else if (sortOption === "income") {
        comparison = a.hourlyIncome - b.hourlyIncome
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    setFilteredItems(result)
  }, [items, searchTerm, sortOption, sortDirection])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemId && collectionRef.current) {
      const selectedElement = collectionRef.current.querySelector(`[data-id="${selectedItemId}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [selectedItemId])

  const toggleSort = (option: "level" | "income") => {
    if (sortOption === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortOption(option)
      setSortDirection("desc")
    }
    setShowSortOptions(false)
  }

  return (
    <div className="bg-gray-900/80 rounded-xl overflow-hidden border border-gray-800/50 backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg mr-3">
              <FontAwesomeIcon icon={icons.pickaxe} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {title} <span className="text-sm text-gray-400 font-normal">({filteredItems.length})</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sort button */}
            <div className="relative">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={icons.sort} />
              </button>

              {showSortOptions && (
                <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={() => toggleSort("level")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center justify-between ${sortOption === "level" ? "bg-gray-700/50" : ""}`}
                  >
                    <span>Seviye</span>
                    {sortOption === "level" && (
                      <FontAwesomeIcon
                        icon={sortDirection === "asc" ? icons.chevronUp : icons.chevronDown}
                        className="text-xs"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => toggleSort("income")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center justify-between ${sortOption === "income" ? "bg-gray-700/50" : ""}`}
                  >
                    <span>Kazanç</span>
                    {sortOption === "income" && (
                      <FontAwesomeIcon
                        icon={sortDirection === "asc" ? icons.chevronUp : icons.chevronDown}
                        className="text-xs"
                      />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-32 bg-gray-800/50 border border-gray-700/50 rounded-lg py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500/50 text-white"
              />
              <FontAwesomeIcon
                icon={icons.search}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={icons.times} className="text-xs" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Equipment list */}
      <div ref={collectionRef} className="max-h-[60vh] overflow-y-auto scrollbar-hide p-3 space-y-2">
        {isLoading ? (
          // Loading skeletons
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl p-3 animate-pulse">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gray-700/50 rounded-lg mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-1/2 mb-2"></div>
                  <div className="h-1.5 bg-gray-700/50 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredItems.length > 0 ? (
          // Equipment cards
          filteredItems.map((item) => (
            <div key={item.id} data-id={item.id}>
              <EquipmentCard
                id={item.id}
                name={item.name}
                image={item.image}
                level={item.level}
                hourlyIncome={item.hourlyIncome}
                isSelected={item.id === selectedItemId}
                onClick={() => onSelectItem(item.id)}
              />
            </div>
          ))
        ) : (
          // Empty state
          <div className="text-center py-8">
            <FontAwesomeIcon icon={icons.search} className="text-3xl text-gray-600 mb-2" />
            <p className="text-gray-400">
              {searchTerm ? `"${searchTerm}" için sonuç bulunamadı` : "Ekipman bulunamadı"}
            </p>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="mt-2 text-yellow-500 text-sm hover:underline">
                Aramayı temizle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
