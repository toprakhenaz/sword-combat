"use client"

import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface Boost {
  id: number
  name: string
  description: string
  duration: number
  multiplier: number
  cost: number
  image: string
  created_at?: string
  updated_at?: string
}

interface BoostForm {
  id?: number
  name: string
  description: string
  duration: number
  multiplier: number
  cost: number
  image: string
}

const emptyForm: BoostForm = {
  name: "",
  description: "",
  duration: 3600, // 1 hour in seconds
  multiplier: 2,
  cost: 100,
  image: "",
}

export default function AdminBoostsPage() {
  const [boosts, setBoosts] = useState<Boost[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editBoost, setEditBoost] = useState<BoostForm | null>(null)
  const [form, setForm] = useState<BoostForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchBoosts()
  }, [])

  const fetchBoosts = async () => {
    setLoading(true)
    const { data } = await supabase.from("boosts").select("*").order("id")
    if (data) {
      const typedBoosts: Boost[] = data.map((boost) => ({
        id: Number(boost.id),
        name: String(boost.name),
        description: String(boost.description),
        duration: Number(boost.duration),
        multiplier: Number(boost.multiplier),
        cost: Number(boost.cost),
        image: String(boost.image),
        created_at: boost.created_at ? String(boost.created_at) : undefined,
        updated_at: boost.updated_at ? String(boost.updated_at) : undefined,
      }))
      setBoosts(typedBoosts)
    } else {
      setBoosts([])
    }
    setLoading(false)
  }

  const handleOpenModal = (boost?: Boost) => {
    if (boost) {
      const { id, name, description, duration, multiplier, cost, image } = boost
      setEditBoost({ id, name, description, duration, multiplier, cost, image })
      setForm({ id, name, description, duration, multiplier, cost, image })
      setImageFile(null)
    } else {
      setEditBoost(null)
      setForm(emptyForm)
      setImageFile(null)
    }
    setModalOpen(true)
  }

  const handleDeleteBoost = async (boostId: number) => {
    if (!confirm("Are you sure you want to delete this boost?")) return

    try {
      const { error } = await supabase.from("boosts").delete().eq("id", boostId)

      if (error) throw error

      // Remove from local state
      setBoosts((prevBoosts) => prevBoosts.filter((b) => b.id !== boostId))
    } catch (error) {
      console.error("Error deleting boost:", error)
      alert("Failed to delete boost")
    }
  }

  const filtered = boosts.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))

  const getBoostLevel = (level: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[Math.min(level, colors.length - 1)] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
          <FontAwesomeIcon icon={icons.rocket} className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Boostlar</h1>
          <p className="text-gray-400">Kullanıcı boost seviyelerini yönetin</p>
        </div>
      </div>

      {/* Search */}
      <AdminCard>
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Boost adı ile ara..."
        />
      </AdminCard>

      {/* Boosts Table */}
      <AdminCard
        title={`Boostlar (${filtered.length})`}
        description="Kullanıcıların boost seviyelerinin detaylı listesi"
      >
        <AdminTable>
          <thead>
            <tr>
              <th>Boost Adı</th>
              <th>Açıklama</th>
              <th>Süre</th>
              <th>Çarpan</th>
              <th>Maliyet</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">Boost bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id}>
                  <td className="font-mono">{b.name}</td>
                  <td>{b.description}</td>
                  <td>{b.duration} saniye</td>
                  <td>{b.multiplier}</td>
                  <td>{b.cost} kredi</td>
                  <td>
                    <button
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                      onClick={() => handleDeleteBoost(b.id)}
                    >
                      <FontAwesomeIcon icon={icons.times} className="h-3 w-3" />
                      <span className="text-xs font-semibold">Sil</span>
                    </button>
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
