"use client"

import { useState, useEffect } from "react"
import HeaderCard from "@/components/header-card"
import Navbar from "@/components/navbar"
import Friends from "@/components/friends"
import ReferenceRow from "@/components/reference-row"
import { Alert, AlertTitle, AlertDescription } from "@/components/alert"
import { Button } from "@/components/button"
import Modal from "@/components/modal"
import { useUser } from "@/contexts/UserContext"
import { claimReferralReward, getUserReferrals } from "@/lib/db-actions"

export default function FriendsPage() {
  const { userId, coins, league, telegramId, refreshUserData } = useUser()
  const [showModal, setShowModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [collectingId, setCollectingId] = useState<string | null>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load user referrals
  useEffect(() => {
    const loadReferrals = async () => {
      if (!userId) return

      try {
        const referralData = await getUserReferrals(userId)
        setReferrals(
          referralData.map((ref) => ({
            referencedId: ref.id,
            referancedName: ref.referred?.username || "Unknown User",
            referenceAmount: ref.reward_amount,
            isClaimed: ref.is_claimed,
          })),
        )
      } catch (error) {
        console.error("Error loading referrals:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadReferrals()
    }
  }, [userId])

  const handleCollectCoins = async (referralId: string) => {
    if (!userId) return

    setCollectingId(referralId)

    try {
      const result = await claimReferralReward(userId, referralId)

      if (result.success) {
        // Update local state
        setReferrals(referrals.map((ref) => (ref.referencedId === referralId ? { ...ref, isClaimed: true } : ref)))

        // Refresh user data to update coins
        await refreshUserData()

        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      }
    } catch (error) {
      console.error("Error collecting referral reward:", error)
    } finally {
      setCollectingId(null)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `https://t.me/your_bot_name?start=ref_${telegramId}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }

    setShowModal(true)
  }

  const shareReferralLink = () => {
    const referralLink = `https://t.me/your_bot_name?start=ref_${telegramId}`
    const shareText = `Join me on SwordCoin and earn coins! Use my referral link:`

    if (window.Telegram && window.Telegram.WebApp) {
      // Use Telegram's share functionality
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
      )
    } else {
      // Fallback to web share API
      if (navigator.share) {
        navigator.share({
          title: "SwordCoin Referral",
          text: shareText,
          url: referralLink,
        })
      } else {
        copyReferralLink()
      }
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#111827] text-white pb-24">
        <HeaderCard coins={coins} league={league} />
        <div className="animate-pulse px-4">
          <div className="h-32 bg-gray-700 rounded-lg mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
        <Navbar />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#111827] text-white pb-24">
      <HeaderCard coins={coins} league={league} />

      <Friends length={referrals.length} />

      {showAlert && (
        <div className="px-4 mb-4">
          <Alert isGreen>
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Your referral reward has been successfully collected.</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="px-4 mb-6 space-y-3">
        <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white" onClick={copyReferralLink}>
          Copy Referral Link
        </Button>

        <Button className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white" onClick={shareReferralLink}>
          Share on Telegram
        </Button>
      </div>

      <div className="px-4 space-y-4">
        <h2 className="text-xl font-bold">My Referrals</h2>

        {referrals.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">No referrals yet. Share your link to earn rewards!</p>
          </div>
        ) : (
          referrals.map((referance) => (
            <ReferenceRow
              key={referance.referencedId}
              referance={referance}
              collectCoins={handleCollectCoins}
              isAnimating={collectingId === referance.referencedId}
            />
          ))
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Referral Link Copied!</h2>
          <p className="mb-4">Share your referral link with friends to earn rewards.</p>
          <p className="text-sm text-gray-400 mb-4">You and your friend will each receive 100,000 coins!</p>
          <Button
            className="bg-gradient-to-r from-green-500 to-green-700 text-white"
            onClick={() => setShowModal(false)}
          >
            OK
          </Button>
        </div>
      </Modal>

      <Navbar />
    </main>
  )
}
