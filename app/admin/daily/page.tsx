"use client"
import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface DailyReward {
  id: number
  day: number
  reward: number
  created_at?: string
  updated_at?: string
}

interface DailyRewardForm {
  id?: number
  day: number
  reward: number
}

const emptyForm: DailyRewardForm = {
  day: 1,
  reward: 100,
}

export default function AdminDailyPage() {
  const [rewards, setRewards] = useState<DailyReward[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editReward, setEditReward] = useState<DailyRewardForm | null>(null)
  const [form, setForm] = useState<DailyRewardForm>(emptyForm)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    setLoading(true)
    const { data } = await supabase.from("daily_rewards").select("*").order("day")
    if (data) {
      const typedRewards: DailyReward[] = data.map((reward) => ({
        id: Number(reward.id),
        day: Number(reward.day),
        reward: Number(reward.reward),
        created_at: reward.created_at ? String(reward.created_at) : undefined,
        updated_at: reward.updated_at ? String(reward.updated_at) : undefined,
      }))
      setRewards(typedRewards)
    } else {
      setRewards([])
    }
    setLoading(false)
  }

  const handleOpenModal = (reward?: DailyReward) => {
    if (reward) {
      const { id, day, reward: rewardAmount } = reward
      setEditReward({ id, day, reward: rewardAmount })
      setForm({ id, day, reward: rewardAmount })
    } else {
      setEditReward(null)
      setForm(emptyForm)
    }
    setModalOpen(true)
  }

  const handleDeleteReward = async (rewardId: number) => {
    if (!confirm("Are you sure you want to delete this reward?")) return

    try {
      const { error } = await supabase.from("daily_rewards").delete().eq("id", rewardId)

      if (error) throw error

      // Remove from local state
      setRewards((prevRewards) => prevRewards.filter((r) => r.id !== rewardId))
    } catch (error) {
      console.error("Error deleting reward:", error)
      alert("Failed to delete reward")
    }
  }

  const filtered = rewards.filter((r) => r.day?.toString().includes(search) || r.reward?.toString().includes(search))

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getDayBadgeColor = (day: number) => {
    if (day <= 7) return "bg-green-500/20 text-green-400"
    if (day <= 14) return "bg-blue-500/20 text-blue-400"
    if (day <= 21) return "bg-purple-500/20 text-purple-400"
    return "bg-yellow-500/20 text-yellow-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
          <FontAwesomeIcon icon={icons.calendar} className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Günlük Ödüller</h1>
          <p className="text-gray-400">Günlük ödül sistemi yönetimi</p>
        </div>
      </div>

      {/* Search */}
      <AdminCard>
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Gün veya ödül miktarı ile ara..."
        />
      </AdminCard>

      {/* Daily Rewards Table */}
      <AdminCard title={`Günlük Ödüller (${filtered.length})`} description="Günlük ödül sisteminin detaylı listesi">
        <AdminTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Gün</th>
              <th>Ödül Miktarı</th>
              <th>Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">Günlük ödül kaydı bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <FontAwesomeIcon icon={icons.calendar} className="h-4 w-4 text-orange-400" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDayBadgeColor(r.day)}`}>
                        Gün {r.day}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={icons.coins} className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-lg">{formatNumber(r.reward || 0)}</span>
                    </div>
                  </td>
                  <td className="text-gray-400 text-sm">
                    {r.created_at ? new Date(r.created_at).toLocaleString("tr-TR") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>
    </div>
  )
}
