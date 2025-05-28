"use client"

// Utility functions
export function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Default league colors (for fallback)
export const defaultLeagueColors = {
  primary: "#8B4513",
  secondary: "#A0522D",
  text: "#FFE0B2",
  glow: "rgba(139, 69, 19, 0.7)",
}
