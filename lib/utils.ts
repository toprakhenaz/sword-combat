import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B"
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  } else {
    return num.toString()
  }
}

export function calculateLeagueReward(league: number): number {
  switch (league) {
    case 2:
      return 50000
    case 3:
      return 500000
    case 4:
      return 5000000
    case 5:
      return 50000000
    case 6:
      return 500000000
    case 7:
      return 5000000000
    default:
      return 0
  }
}
