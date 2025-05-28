"use client"
import { useState, useMemo } from "react"
import { STATIC_LEAGUES } from "@/data/StaticLeagues"

export interface League {
  id: number
  name: string
  color: string
  image: string
  description: string
  coin_requirement: number
  colors: {
    primary: string
    secondary: string
    text: string
    glow: string
  }
}

export function useLeagues() {
  const [leagues] = useState<League[]>(STATIC_LEAGUES)

  const getLeagueById = useMemo(() => {
    return (id?: number) => {
      if (!id) return null

      const league = leagues.find((l) => l.id === id)
      if (!league) {
        // Varsayılan değerler
        return {
          id: id || 1,
          name: `League ${id || 1}`,
          color: "#8B4513",
          image: "/leagues/wooden-sword.png",
          description: "League",
          coin_requirement: 0,
          colors: {
            primary: "#8B4513",
            secondary: "#6B3410",
            text: "#ffffff",
            glow: "rgba(139, 69, 19, 0.7)",
          },
        }
      }

      return league
    }
  }, [leagues])

  const getLeagueColors = useMemo(() => {
    return (leagueId: number) => {
      const league = getLeagueById(leagueId)
      return (
        league?.colors || {
          primary: "#8B4513",
          secondary: "#6B3410",
          text: "#ffffff",
          glow: "rgba(139, 69, 19, 0.7)",
        }
      )
    }
  }, [getLeagueById])

  return {
    leagues,
    getLeagueById,
    getLeagueColors,
    loading: false,
  }
}
