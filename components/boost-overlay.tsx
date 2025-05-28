"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagues } from "@/hooks/useLeagues"

interface BoostOverlayProps {
  onClose: () => void
  coins: number
  dailyRockets: number
  maxDailyRockets: number
  energyFull: boolean
  boosts: {
    multiTouch: { level: number; cost: number }
    energyLimit: { level: number; cost: number }
    chargeSpeed: { level: number; cost: number }
  }
  onBoostUpgrade: (boostType: string) => void
  onUseRocket: () => void
  onUseFullEnergy: () => void
}

export default function BoostOverlay({
  onClose,
  coins,
  dailyRockets,
  maxDailyRockets,
  energyFull,
  boosts,
  onBoostUpgrade,
  onUseRocket,
  onUseFullEnergy,
}: BoostOverlayProps) {
  const { getLeagueColors } = useLeagues()
  const colors = getLeagueColors(6) // Use league 6 colors for the boost overlay

  // Maksimum boost seviyesi
  const MAX_BOOST_LEVEL = 3

  // Sabit boyut değişkenleri - Friends sayfası ile uyumlu
  const SPACING = {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
  }

  const SIZES = {
    iconContainer: "3rem", // 12 (w-12) - Friends sayfası ile uyumlu
    innerIcon: "2rem", // 8 (w-8) - Friends sayfası ile uyumlu
    upgradeButton: "2.5rem", // Küçültüldü
    actionIconContainer: "2rem", // Küçültüldü
    borderRadius: {
      sm: "0.375rem",
      md: "0.75rem",
      lg: "1rem",
      full: "9999px",
    },
  }

  const FONTS = {
    xs: "0.75rem", // text-xs
    sm: "0.875rem", // text-sm
    base: "1rem", // text-base
    lg: "1.125rem", // text-lg
    xl: "1.25rem", // text-xl
    "2xl": "1.5rem", // text-2xl
    "3xl": "1.875rem", // text-3xl
  }

  // Sabit renk değişkenleri
  const COLORS = {
    rocket: {
      gradient: "linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(239, 68, 68, 0.3))",
      border: "1px solid rgba(239, 68, 68, 0.4)",
      shadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
      background: "",
      iconFrom: "rgb(239, 68, 68)",
      iconTo: "rgb(249, 115, 22)",
      innerBg: "rgb(252, 165, 165)", // Kırmızı iç ikon arka planı
      iconColor: "rgb(185, 28, 28)", // Kırmızı iç ikon rengi
      text: "rgb(249, 115, 22)",
      actionGradient: "linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(239, 68, 68, 0.9))",
      actionShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
      actionBorder: "1px solid rgba(239, 68, 68, 0.6)",
    },
    energy: {
      gradient: "linear-gradient(135deg, rgba(22, 163, 74, 0.2), rgba(34, 197, 94, 0.3))",
      border: "1px solid rgba(34, 197, 94, 0.4)",
      shadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
      background: "",
      iconFrom: "rgb(34, 197, 94)",
      iconTo: "rgb(21, 128, 61)",
      innerBg: "rgb(134, 239, 172)", // Yeşil iç ikon arka planı
      iconColor: "rgb(22, 101, 52)", // Yeşil iç ikon rengi
      text: "rgb(34, 197, 94)",
      actionGradient: "linear-gradient(135deg, rgba(22, 163, 74, 0.8), rgba(34, 197, 94, 0.9))",
      actionShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
      actionBorder: "1px solid rgba(34, 197, 94, 0.6)",
    },
    multiTouch: {
      gradient: "linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(250, 204, 21, 0.3))",
      border: "1px solid rgba(250, 204, 21, 0.4)",
      shadow: "0 4px 12px rgba(250, 204, 21, 0.2)",
      background: "",
      iconFrom: "rgb(234, 179, 8)",
      iconTo: "rgb(161, 98, 7)",
      innerBg: "rgb(253, 224, 71)", // Sarı iç ikon arka planı
      iconColor: "rgb(161, 98, 7)", // Sarı iç ikon rengi
      text: "rgb(234, 179, 8)",
    },
    chargeSpeed: {
      gradient: "linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.3))",
      border: "1px solid rgba(59, 130, 246, 0.4)",
      shadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
      background: "",
      iconFrom: "rgb(59, 130, 246)",
      iconTo: "rgb(91, 33, 182)",
      innerBg: "rgb(147, 197, 253)", // Mavi iç ikon arka planı
      iconColor: "rgb(30, 64, 175)", // Mavi iç ikon rengi
      text: "rgb(96, 165, 250)",
    },
  }

  const buttonGradient = `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}80)`
  const buttonBorder = `1px solid ${colors.secondary}80`
  const buttonShadow = `0 0 10px ${colors.glow}`

  // Stil fonksiyonları
  const createTitleStyle = () => ({
    color: colors.text,
    position: "relative" as const,
    display: "inline-block" as const,
    width: "100%" as const,
    textAlign: "center" as const,
    marginBottom: SPACING.lg,
    fontSize: FONTS["2xl"],
    fontWeight: "bold",
    padding: `${SPACING.xs} 0`,
  })

  const createTitleUnderlineStyle = () => ({
    position: "absolute" as const,
    left: 0,
    right: 0,
    height: "2px",
    bottom: "-4px",
    borderRadius: SIZES.borderRadius.full,
    background: `linear-gradient(90deg, transparent, ${colors.secondary}, transparent)`,
    boxShadow: `0 0 10px ${colors.glow}`,
  })

  const createCardStyle = (gradient: string, border: string, shadow: string) => ({
    borderRadius: SIZES.borderRadius.md,
    padding: SPACING.md,
    position: "relative" as const,
    overflow: "hidden" as const,
    transition: "transform 0.2s ease-in-out",
    background: gradient,
    border: border,
    boxShadow: shadow,
  })

  const createCardBackgroundStyle = (background: string) => ({
    position: "absolute" as const,
    inset: 0,
    opacity: 0,
    background: background || "transparent",
  })

  // Friends sayfası ile uyumlu ikon konteyner stili
  const createIconContainerStyle = (fromColor: string, toColor: string) => ({
    width: SIZES.iconContainer,
    height: SIZES.iconContainer,
    background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
    borderRadius: SIZES.borderRadius.full,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    zIndex: 10,
    aspectRatio: "1 / 1", // Ensure perfect circle
  })

  // Friends sayfası ile uyumlu iç ikon stili
  const createInnerIconStyle = (bgColor: string) => ({
    width: SIZES.innerIcon,
    height: SIZES.innerIcon,
    background: bgColor,
    borderRadius: SIZES.borderRadius.full,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1 / 1", // Ensure perfect circle
  })

  const createUpgradeButtonStyle = () => ({
    width: SIZES.upgradeButton,
    height: SIZES.upgradeButton,
    borderRadius: SIZES.borderRadius.full,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transition: "transform 0.2s ease-in-out",
    background: buttonGradient,
    border: buttonBorder,
    boxShadow: buttonShadow,
    color: "white",
  })

  const createActionButtonStyle = (gradient: string, shadow: string, border: string, disabled: boolean) => ({
    padding: SPACING.md,
    borderRadius: SIZES.borderRadius.md,
    fontWeight: "bold",
    color: "white",
    textAlign: "center" as const,
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: shadow,
    background: gradient,
    border: border,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    height: "4rem", // Küçültüldü
  })

  const createActionIconContainerStyle = (bgColor: string) => ({
    width: SIZES.actionIconContainer,
    height: SIZES.actionIconContainer,
    borderRadius: SIZES.borderRadius.full,
    background: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
    aspectRatio: "1 / 1", // Ensure perfect circle
  })

  // Boost seviyesi maksimuma ulaştı mı kontrolü
  const isMaxLevel = (boostType: string) => {
    return boosts[boostType as keyof typeof boosts].level >= MAX_BOOST_LEVEL
  }

  // Boost seviyesi progress bar'ı
  const getBoostProgress = (level: number) => {
    return (level / MAX_BOOST_LEVEL) * 100
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 text-white flex flex-col backdrop-blur-md">
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{
          background: `linear-gradient(to right, ${colors.primary}20, ${colors.secondary}20)`,
          borderBottom: `1px solid ${colors.secondary}40`,
          boxShadow: `0 2px 10px ${colors.glow}30`,
        }}
      >
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-gray-800/50"
        >
          <FontAwesomeIcon icon={icons.chevronLeft} className="mr-2" />
          Back
        </button>
        <div className="flex items-center bg-gray-800/70 px-4 py-2 rounded-full backdrop-blur-sm">
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
          <span className="text-xl font-bold">{coins.toLocaleString()}</span>
        </div>
        <button className="text-gray-400 hover:text-white px-3 py-2 rounded-full hover:bg-gray-800/50">
          <FontAwesomeIcon icon={icons.infoCircle} />
        </button>
      </div>

      <div className="p-6 flex-grow overflow-auto">
        <h1 style={createTitleStyle()}>
          <span style={createTitleUnderlineStyle()}></span>
          Free Daily Boosts
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className="hover:scale-105"
            style={createCardStyle(COLORS.rocket.gradient, COLORS.rocket.border, COLORS.rocket.shadow)}
          >
            <div style={createCardBackgroundStyle(COLORS.rocket.background)}></div>
            <div className="flex items-center relative">
              <div style={createIconContainerStyle(COLORS.rocket.iconFrom, COLORS.rocket.iconTo)}>
                <div style={createInnerIconStyle(COLORS.rocket.innerBg)}>
                  <FontAwesomeIcon
                    icon={icons.rocket}
                    className="animate-pulse"
                    style={{ color: COLORS.rocket.iconColor, animationDuration: "2s" }}
                  />
                </div>
              </div>
              <div className="z-10">
                <p className="text-xs text-gray-300">Daily Boost</p>
                <div className="flex items-center">
                  <p className="text-sm font-bold" style={{ color: COLORS.rocket.text }}>
                    Rocket Boost{" "}
                    <span className="text-white">
                      {dailyRockets}/{maxDailyRockets}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="hover:scale-105"
            style={createCardStyle(COLORS.energy.gradient, COLORS.energy.border, COLORS.energy.shadow)}
          >
            <div style={createCardBackgroundStyle(COLORS.energy.background)}></div>
            <div className="flex items-center relative">
              <div style={createIconContainerStyle(COLORS.energy.iconFrom, COLORS.energy.iconTo)}>
                <div style={createInnerIconStyle(COLORS.energy.innerBg)}>
                  <FontAwesomeIcon
                    icon={icons.batteryFull}
                    className="animate-pulse"
                    style={{ color: COLORS.energy.iconColor, animationDuration: "2s" }}
                  />
                </div>
              </div>
              <div className="z-10">
                <p className="text-xs text-gray-300">Daily Boost</p>
                <p className="text-sm font-bold" style={{ color: COLORS.energy.text }}>
                  Full Energy{" "}
                  <span className={`${energyFull ? "text-red-400" : "text-green-400"}`}>
                    {energyFull ? "Used" : "Available"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <h1 style={createTitleStyle()}>
          <span style={createTitleUnderlineStyle()}></span>
          Permanent Upgrades
        </h1>

        <div className="space-y-4">
          <div
            className="hover:scale-105"
            style={createCardStyle(COLORS.multiTouch.gradient, COLORS.multiTouch.border, COLORS.multiTouch.shadow)}
          >
            <div style={createCardBackgroundStyle(COLORS.multiTouch.background)}></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center z-10">
                <div style={createIconContainerStyle(COLORS.multiTouch.iconFrom, COLORS.multiTouch.iconTo)}>
                  <div style={createInnerIconStyle(COLORS.multiTouch.innerBg)}>
                    <FontAwesomeIcon icon={icons.handPointer} style={{ color: COLORS.multiTouch.iconColor }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-300">Upgrade</p>
                  <p className="text-sm font-bold" style={{ color: COLORS.multiTouch.text }}>
                    Multi-Touch{" "}
                    <span className="text-white">
                      Lv.{boosts.multiTouch.level}/{MAX_BOOST_LEVEL}
                    </span>
                  </p>
                  <div className="flex items-center text-xs">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
                    {isMaxLevel("multiTouch") ? (
                      <span className="text-green-400">Maximum Level Reached!</span>
                    ) : (
                      <>
                        <span className="text-white">{boosts.multiTouch.cost.toLocaleString()}</span>
                        <span className="ml-2 text-green-400">+{boosts.multiTouch.level * 2} coins/tap</span>
                      </>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full"
                      style={{ width: `${getBoostProgress(boosts.multiTouch.level)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              {!isMaxLevel("multiTouch") && (
                <button
                  className="hover:scale-110 active:scale-95"
                  style={createUpgradeButtonStyle()}
                  onClick={() => {
                    // Add immediate visual feedback
                    const button = document.activeElement as HTMLElement
                    if (button) {
                      button.classList.add("scale-90")
                      setTimeout(() => button.classList.remove("scale-90"), 100)
                    }
                    onBoostUpgrade("multiTouch")
                  }}
                >
                  <FontAwesomeIcon icon={icons.plus} />
                </button>
              )}
            </div>
          </div>

          <div
            className="hover:scale-105"
            style={createCardStyle(COLORS.energy.gradient, COLORS.energy.border, COLORS.energy.shadow)}
          >
            <div style={createCardBackgroundStyle(COLORS.energy.background)}></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center z-10">
                <div style={createIconContainerStyle(COLORS.energy.iconFrom, COLORS.energy.iconTo)}>
                  <div style={createInnerIconStyle(COLORS.energy.innerBg)}>
                    <FontAwesomeIcon icon={icons.batteryFull} style={{ color: COLORS.energy.iconColor }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-300">Upgrade</p>
                  <p className="text-sm font-bold" style={{ color: COLORS.energy.text }}>
                    Energy Limit{" "}
                    <span className="text-white">
                      Lv.{boosts.energyLimit.level}/{MAX_BOOST_LEVEL}
                    </span>
                  </p>
                  <div className="flex items-center text-xs">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
                    {isMaxLevel("energyLimit") ? (
                      <span className="text-green-400">Maximum Level Reached!</span>
                    ) : (
                      <>
                        <span className="text-white">{boosts.energyLimit.cost.toLocaleString()}</span>
                        <span className="ml-2 text-green-400">+{(boosts.energyLimit.level - 1) * 500} max energy</span>
                      </>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
                    <div
                      className="bg-green-400 h-full rounded-full"
                      style={{ width: `${getBoostProgress(boosts.energyLimit.level)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              {!isMaxLevel("energyLimit") && (
                <button
                  className="hover:scale-110 active:scale-95"
                  style={createUpgradeButtonStyle()}
                  onClick={() => {
                    // Add immediate visual feedback
                    const button = document.activeElement as HTMLElement
                    if (button) {
                      button.classList.add("scale-90")
                      setTimeout(() => button.classList.remove("scale-90"), 100)
                    }
                    onBoostUpgrade("energyLimit")
                  }}
                >
                  <FontAwesomeIcon icon={icons.plus} />
                </button>
              )}
            </div>
          </div>

          <div
            className="hover:scale-105"
            style={createCardStyle(COLORS.chargeSpeed.gradient, COLORS.chargeSpeed.border, COLORS.chargeSpeed.shadow)}
          >
            <div style={createCardBackgroundStyle(COLORS.chargeSpeed.background)}></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center z-10">
                <div style={createIconContainerStyle(COLORS.chargeSpeed.iconFrom, COLORS.chargeSpeed.iconTo)}>
                  <div style={createInnerIconStyle(COLORS.chargeSpeed.innerBg)}>
                    <FontAwesomeIcon icon={icons.bolt} style={{ color: COLORS.chargeSpeed.iconColor }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-300">Upgrade</p>
                  <p className="text-sm font-bold" style={{ color: COLORS.chargeSpeed.text }}>
                    Charge Speed{" "}
                    <span className="text-white">
                      Lv.{boosts.chargeSpeed.level}/{MAX_BOOST_LEVEL}
                    </span>
                  </p>
                  <div className="flex items-center text-xs">
                    <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-xs" />
                    {isMaxLevel("chargeSpeed") ? (
                      <span className="text-green-400">Maximum Level Reached!</span>
                    ) : (
                      <>
                        <span className="text-white">{boosts.chargeSpeed.cost.toLocaleString()}</span>
                        <span className="ml-2 text-blue-400">+{boosts.chargeSpeed.level * 20}% recharge rate</span>
                      </>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-400 h-full rounded-full"
                      style={{ width: `${getBoostProgress(boosts.chargeSpeed.level)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              {!isMaxLevel("chargeSpeed") && (
                <button
                  className="hover:scale-110 active:scale-95"
                  style={createUpgradeButtonStyle()}
                  onClick={() => {
                    // Add immediate visual feedback
                    const button = document.activeElement as HTMLElement
                    if (button) {
                      button.classList.add("scale-90")
                      setTimeout(() => button.classList.remove("scale-90"), 100)
                    }
                    onBoostUpgrade("chargeSpeed")
                  }}
                >
                  <FontAwesomeIcon icon={icons.plus} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            className={`hover:scale-105 active:scale-95 ${dailyRockets <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            style={createActionButtonStyle(
              COLORS.rocket.actionGradient,
              COLORS.rocket.actionShadow,
              COLORS.rocket.actionBorder,
              dailyRockets <= 0,
            )}
            onClick={() => {
              if (dailyRockets <= 0) return
              // Add immediate visual feedback
              const button = document.activeElement as HTMLElement
              if (button) {
                button.classList.add("scale-95")
                setTimeout(() => button.classList.remove("scale-95"), 100)
              }
              onUseRocket()
            }}
            disabled={dailyRockets <= 0}
          >
            <div style={createActionIconContainerStyle("rgba(185, 28, 28, 0.5)")}>
              <FontAwesomeIcon icon={icons.rocket} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Use Rocket</div>
              <div className="text-xs text-red-200">+500 energy instantly</div>
            </div>
          </button>

          <button
            className={`hover:scale-105 active:scale-95 ${energyFull ? "opacity-50 cursor-not-allowed" : ""}`}
            style={createActionButtonStyle(
              COLORS.energy.actionGradient,
              COLORS.energy.actionShadow,
              COLORS.energy.actionBorder,
              energyFull,
            )}
            onClick={() => {
              if (energyFull) return
              // Add immediate visual feedback
              const button = document.activeElement as HTMLElement
              if (button) {
                button.classList.add("scale-95")
                setTimeout(() => button.classList.remove("scale-95"), 100)
              }
              onUseFullEnergy()
            }}
            disabled={energyFull}
          >
            <div style={createActionIconContainerStyle("rgba(22, 101, 52, 0.5)")}>
              <FontAwesomeIcon icon={icons.batteryFull} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Full Energy</div>
              <div className="text-xs text-green-200">Refill to maximum</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
