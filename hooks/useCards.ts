"use client"

import { useEffect, useState } from "react"
import type { CardData } from "@/types"
import { getAllItems } from "@/lib/db-actions"

export function useCards() {
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchCards = async () => {
      try {
        // Veritabanında "cards" tablosu yerine "items" tablosunu kullan
        const data = await getAllItems()

        if (mounted) {
          // items tablosundan gelen veriyi CardData formatına dönüştür
          const formattedCards = data.map((item) => ({
            id: item.id,
            name: item.name || `Item ${item.id}`,
            image: item.image || "/placeholder.svg",
            level: 1,
            hourlyIncome: item.base_hourly_income || 0,
            upgradeCost: item.base_upgrade_cost || 100,
          }))

          setCards(formattedCards)
          setError(null)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to fetch cards")
          setCards([])
          setLoading(false)
        }
      }
    }

    fetchCards()

    return () => {
      mounted = false
    }
  }, [])

  // Get card by ID
  const getCardById = (id?: number) => {
    if (!id) return null
    return cards.find((c) => c.id === id) || null
  }

  // Get card image
  const getCardImage = (id?: number) => {
    const card = getCardById(id)
    return card?.image || "/placeholder.svg"
  }

  return { cards, loading, error, getCardById, getCardImage }
}
