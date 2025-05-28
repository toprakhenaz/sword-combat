import type React from "react"
// Common types for the application

// Card Component Types
export interface CardData {
  id: number
  name: string
  image: string
  level: number
  hourlyIncome: number
  upgradeCost: number
}

export interface CardProps {
  card: CardData
  onUpgrade: (id: number) => void
  coins: number
}

// Confirmation Popup Types
export interface ConfirmationPopupProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

// Bottom Nav Types
export interface BottomNavProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
}

// Timer Bar Types
export interface TimerBarProps {
  dailyCombo: number[]
  foundCards: number[]
}

// Coin Display Types
export interface CoinDisplayProps {
  coins: number
  league: number
  onclick: () => void
}

// Header Types
export interface HeaderProps {
  earnPerTap: number
  coinsToLevelUp: number
  hourlyEarn: number
}

// Central Button Types
export interface CentralButtonProps {
  onClick: () => void
  league: number
}

// League Overlay Types
export interface LeagueOverlayProps {
  onClose: () => void
  coins: number
}

// Energy Bar Types
export interface EnergyBarProps {
  energy: number
  maxEnergy: number
  boost: () => void
  onOpenBoostOverlay: () => void
  league?: number
}

// Referance Row Types
export interface RefferanceRowProps {
  referance: {
    referencedId: string
    referancedName: string
    referenceAmount: number
    isClaimed: boolean
  }
  collectCoins: (id: string) => void
  isAnimating?: boolean
}

// Friends Component Types
export interface FriendsProps {
  length: number
}

// EarnCard Types
export interface EarnCardProps {
  className?: string
  children?: React.ReactNode
}

// Progress Types
export interface ProgressProps {
  value: number
  className?: string
}

// Modal Types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

// Button Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

// Alert Types
export interface AlertProps {
  children: React.ReactNode
  isGreen?: boolean
}
