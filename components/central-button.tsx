"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useLeagues } from "@/hooks/useLeagues"
import type { CentralButtonProps } from "@/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useUser } from "@/contexts/UserContext"

interface FloatingNumber {
  id: number
  value: number
  x: number
  y: number
  opacity: number
  scale: number
  rotation: number
}

const CentralButton: React.FC<CentralButtonProps> = ({ onClick, league }) => {
  const { earnPerTap, energy } = useUser()
  const [isPressed, setIsPressed] = useState(false)
  const [showRipple, setShowRipple] = useState(false)
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 })
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([])
  const [nextId, setNextId] = useState(0)
  const { getLeagueById, getLeagueColors } = useLeagues()
  const leagueObj = getLeagueById(league)
  const colors = getLeagueColors(league)

  // Check if energy is depleted
  const isEnergyDepleted = energy <= 0

  // Clean up old floating numbers
  useEffect(() => {
    const timer = setInterval(() => {
      setFloatingNumbers((prev) => prev.filter((num) => num.opacity > 0))
    }, 100)

    return () => clearInterval(timer)
  }, [])

  // Handle button press with touch and click support
  const handleButtonPress = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // If energy is depleted, just call onClick without effects
    if (isEnergyDepleted) {
      onClick()
      return
    }

    // If we're already showing effects, don't trigger again too quickly
    if (showRipple) return

    // Calculate ripple position relative to button
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()

    // Handle both mouse and touch events
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    setRipplePosition({ x, y })
    setShowRipple(true)
    setIsPressed(true)

    // Trigger vibration if available in the browser
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50) // vibrate for 50ms
    }

    // Call the onClick handler passed from parent
    onClick()

    // Create multiple floating numbers for visual effect
    const numberOfFloatingNumbers = Math.min(3, Math.max(1, Math.floor(earnPerTap / 10)))

    for (let i = 0; i < numberOfFloatingNumbers; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 20 + Math.random() * 40
      const delay = i * 100 // Stagger the appearance

      setTimeout(() => {
        const newNumber = {
          id: nextId + i,
          value: earnPerTap,
          x: 50 + Math.cos(angle) * distance,
          y: 50 + Math.sin(angle) * distance,
          opacity: 1,
          scale: 1,
          rotation: -15 + Math.random() * 30,
        }

        setFloatingNumbers((prev) => [...prev, newNumber])
      }, delay)
    }

    setNextId(nextId + numberOfFloatingNumbers)

    // Automatically reset pressed state after animation
    setTimeout(() => {
      setIsPressed(false)
      setShowRipple(false)
    }, 300)
  }

  return (
    <div className="flex items-center justify-center relative">
      {/* Pulsating rings animation - only shown when energy is available */}
      {!isEnergyDepleted && (
        <>
          <div
            className="absolute w-60 h-60 rounded-full opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${colors.secondary}80, ${colors.secondary}20)`,
              animationDuration: "3s",
              transition: "background 0.5s ease",
            }}
          ></div>
          <div
            className="absolute w-52 h-52 rounded-full opacity-15 animate-pulse"
            style={{
              animationDelay: "1.5s",
              animationDuration: "2.5s",
              background: `radial-gradient(circle, ${colors.secondary}60, ${colors.secondary}10)`,
              transition: "background 0.5s ease",
            }}
          ></div>

          {/* Particles around the button */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const radius = 140 + Math.sin(Date.now() / 1000 + i) * 10
            const size = 2 + Math.random() * 4
            return (
              <div
                key={i}
                className="absolute rounded-full animate-pulse"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  background: `${colors.secondary}`,
                  boxShadow: `0 0 10px ${colors.glow}`,
                  animationDuration: `${2 + (i % 3)}s`,
                  zIndex: 5,
                  transition: "background 0.5s ease, box-shadow 0.5s ease",
                }}
              />
            )
          })}
        </>
      )}

      {/* Floating numbers - only shown when energy is available */}
      {!isEnergyDepleted &&
        floatingNumbers.map((num) => (
          <div
            key={num.id}
            className="absolute pointer-events-none flex items-center z-20"
            style={{
              left: `${num.x}%`,
              top: `${num.y}%`,
              opacity: num.opacity,
              transform: `scale(${num.scale}) rotate(${num.rotation}deg)`,
              transition: "all 0.8s ease-out",
              animation: "floatUp 1s forwards ease-out",
            }}
            onAnimationEnd={() => {
              setFloatingNumbers((prev) => prev.map((n) => (n.id === num.id ? { ...n, opacity: 0 } : n)))
            }}
          >
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
            <span className="text-yellow-300 font-bold text-lg">+{num.value}</span>
          </div>
        ))}

      <button
        className="relative overflow-hidden z-10 outline-none focus:outline-none"
        onClick={handleButtonPress}
        onTouchStart={handleButtonPress}
        onMouseDown={(e) => e.preventDefault()} // Prevent text selection
        style={{
          width: "14rem",
          height: "14rem",
          borderRadius: "50%",
          border: `8px solid ${colors.secondary}`,
          background: `radial-gradient(circle, ${colors.primary}80, ${colors.secondary})`,
          boxShadow:
            isPressed && !isEnergyDepleted
              ? `0 0 30px ${colors.glow}, inset 0 0 25px rgba(255, 255, 255, 0.6)`
              : isEnergyDepleted
                ? `0 0 10px ${colors.glow}40, inset 0 0 10px rgba(255, 255, 255, 0.2)` // Dimmed when energy depleted
                : `0 0 20px ${colors.glow}, inset 0 0 15px rgba(255, 255, 255, 0.4)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.3s ease, background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease",
          transform: isPressed && !isEnergyDepleted ? "scale(0.9)" : "scale(1)",
          outline: "none",
          borderColor: isEnergyDepleted ? `${colors.secondary}60` : colors.secondary, // Dimmed border when energy depleted
          WebkitTapHighlightColor: "transparent", // Remove tap highlight on mobile
          opacity: isEnergyDepleted ? 0.7 : 1, // Dim the button when energy is depleted
          touchAction: "manipulation", // Prevent zoom on double tap
        }}
      >
        {/* Ripple effect - only shown when energy is available */}
        {showRipple && !isEnergyDepleted && (
          <span
            className="absolute rounded-full opacity-40 animate-ripple"
            style={{
              top: ripplePosition.y,
              left: ripplePosition.x,
              width: "300px",
              height: "300px",
              marginLeft: "-150px",
              marginTop: "-150px",
              background: colors.primary,
            }}
          />
        )}

        {/* Button inner glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.secondary}30, transparent 70%)`,
            opacity: isPressed && !isEnergyDepleted ? 0.8 : isEnergyDepleted ? 0.3 : 0.5,
            transition: "background 0.5s ease",
          }}
        />

        {/* Button content */}
        <div
          className="relative z-10 transform transition-transform duration-300"
          style={{
            transform: isPressed && !isEnergyDepleted ? "scale(0.95)" : "scale(1)",
          }}
        >
          <Image
            src={leagueObj?.image || "/leagues/wooden-sword.png"}
            alt={`League ${league}`}
            width={180}
            height={180}
            priority
            className={`drop-shadow-lg ${isEnergyDepleted ? "grayscale" : ""}`}
            style={{
              filter: isEnergyDepleted
                ? `drop-shadow(0 0 5px ${colors.glow}50)`
                : `drop-shadow(0 0 10px ${colors.glow})`,
              transition: "filter 0.5s ease",
            }}
          />
        </div>
      </button>

      {/* Energy depleted overlay */}
      {isEnergyDepleted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 px-4 py-2 rounded-full">
            <div className="text-white text-sm font-bold flex items-center">
              <FontAwesomeIcon icon={icons.bolt} className="text-red-400 mr-2" />
              Energy Depleted
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CentralButton
