import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  // Round to 2 decimal places to avoid floating point precision issues
  const roundedNum = Math.round(num * 100) / 100

  if (roundedNum >= 1000000000) {
    return (roundedNum / 1000000000).toFixed(1) + "B"
  } else if (roundedNum >= 1000000) {
    return (roundedNum / 1000000).toFixed(1) + "M"
  } else if (roundedNum >= 1000) {
    return (roundedNum / 1000).toFixed(1) + "K"
  } else {
    // For numbers less than 1000, show at most 1 decimal place
    return Number(roundedNum.toFixed(1)).toString()
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
