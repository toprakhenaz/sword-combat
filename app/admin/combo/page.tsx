"use client"
import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface Combo {
  id: number
  card_ids: number[]
  reward: number
  combo_date: string
  created_at?: string
  updated_at?: string
}

interface ComboForm {
  id?: number
  card_ids: number[]
  reward: number
  combo_date: string
}

const emptyForm: ComboForm = {
  card_ids: [],
  reward: 1000,
  combo_date: new Date().toISOString().split("T")[0],
}

export default function AdminComboPage() {
  const [combos, setCombos] = useState<Combo[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCombo, setEditCombo] = useState<ComboForm | null>(null)
  const [form, setForm] = useState<ComboForm>(emptyForm)

  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    setLoading(true)
    const { data } = await supabase.from("daily_combos").select("*").order("combo_date", { ascending: false })
    if (data) {
      const typedCombos: Combo[] = data.map((combo) => ({
        id: Number(combo.id),
        card_ids: Array.isArray(combo.card_ids) ? combo.card_ids.map(Number) : [],
        reward: Number(combo.reward),
        combo_date: String(combo.combo_date),
        created_at: combo.created_at ? String(combo.created_at) : undefined,
        updated_at: combo.updated_at ? String(combo.updated_at) : undefined,
      }))
      setCombos(typedCombos)
    } else {
      setCombos([])
    }
    setLoading(false)
  }

  const handleOpenModal = (combo?: Combo) => {
    if (combo) {
      const { id, card_ids, reward, combo_date } = combo
      setEditCombo({ id, card_ids, reward, combo_date })
      setForm({ id, card_ids, reward, combo_date })
    } else {
      setEditCombo(null)
      setForm(emptyForm)
    }
    setModalOpen(true)
  }

  const handleDeleteCombo = async (comboId: number) => {
    if (!confirm("Are you sure you want to delete this combo?")) return

    try {
      const { error } = await supabase.from("daily_combos").delete().eq("id", comboId)

      if (error) throw error

      // Remove from local state
      setCombos((prevCombos) => prevCombos.filter((c) => c.id !== comboId))
    } catch (error) {
      console.error("Error deleting combo:", error)
      alert("Failed to delete combo")
    }
  }

  const filtered = combos.filter(
    (c) => c.combo_date?.toString().includes(search) || c.reward?.toString().includes(search),
  )

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getCardIds = (cardIds: any) => {
    if (Array.isArray(cardIds)) {
      return cardIds
    }
    if (typeof cardIds === "string") {
      try {
        return JSON.parse(cardIds)
      } catch {
        return cardIds.split(",").map((id) => id.trim())
      }
    }
    return []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
          <FontAwesomeIcon icon={icons.star} className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Combo Sistemi</h1>
          <p className="text-gray-400">Günlük kart kombosu yönetimi</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Toplam Combo</p>
              <p className="text-2xl font-bold text-yellow-400">{combos.length}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.star} className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Toplam Ödül</p>
              <p className="text-2xl font-bold text-green-400">
                {formatNumber(combos.reduce((sum, c) => sum + (c.reward || 0), 0))}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.coins} className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Ortalama Ödül</p>
              <p className="text-2xl font-bold text-blue-400">
                {combos.length > 0
                  ? formatNumber(Math.round(combos.reduce((sum, c) => sum + (c.reward || 0), 0) / combos.length))
                  : "0"}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.gift} className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Search */}
      <AdminCard>
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tarih veya ödül miktarı ile ara..."
        />
      </AdminCard>

      {/* Combos Table */}
      <AdminCard
        title={`Günlük Kombolar (${filtered.length})`}
        description="Tüm günlük kart kombolarının detaylı listesi"
      >
        <AdminTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tarih</th>
              <th>Kart Kombinasyonu</th>
              <th>Ödül</th>
              <th>Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">Combo kaydı bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td className="font-mono text-xs">{c.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <FontAwesomeIcon icon={icons.calendar} className="h-4 w-4 text-yellow-400" />
                      </div>
                      <span className="font-semibold">{formatDate(c.combo_date)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCardIds(c.card_ids).map((cardId: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={icons.star} className="h-3 w-3" />
                          {cardId}
                        </span>
                      ))}
                      {getCardIds(c.card_ids).length === 0 && (
                        <span className="text-gray-500 text-sm">Kart bilgisi yok</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={icons.coins} className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-lg text-yellow-400">{formatNumber(c.reward || 0)}</span>
                    </div>
                  </td>
                  <td className="text-gray-400 text-sm">
                    {c.created_at ? new Date(c.created_at).toLocaleString("tr-TR") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>

      {/* Info Card */}
      <AdminCard
        title="Combo Sistemi Hakkında"
        description="Günlük kart kombosu nasıl çalışır?"
        className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={icons.infoCircle} className="h-4 w-4 text-blue-400" />
              Nasıl Çalışır?
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={icons.check} className="h-3 w-3 text-green-400" />
                Her gün yeni bir kart kombinasyonu belirlenir
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={icons.check} className="h-3 w-3 text-green-400" />
                Oyuncular doğru kartları seçerek ödül kazanır
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={icons.check} className="h-3 w-3 text-green-400" />
                Kombinasyon her gün gece yarısı sıfırlanır
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={icons.star} className="h-4 w-4 text-yellow-400" />
              Ödül Sistemi
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={icons.coins} className="h-3 w-3 text-yellow-400" />
                Doğru kombinasyon bulunduğunda ödül verilir
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={icons.gift} className="h-3 w-3 text-purple-400" />
                Ödül miktarı kombonun zorluğuna göre değişir
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={icons.clock} className="h-3 w-3 text-blue-400" />
                Günde sadece bir kez kazanılabilir
              </li>
            </ul>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}
