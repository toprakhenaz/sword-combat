"use client"

import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    totalCoins: 0,
    averageCoins: 0,
    topLeague: "",
  })
  const [editUser, setEditUser] = useState<any | null>(null)
  const [editCoins, setEditCoins] = useState(0)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data, error } = await supabase.from("users").select("*")
      if (!error && data) {
        setUsers(data)

        // Calculate stats
        const total = data.length
        const totalCoins = data.reduce((sum, user) => sum + (user.coins || 0), 0)
        const averageCoins = total > 0 ? Math.round(totalCoins / total) : 0
        const leagues = data.map((u) => u.league).filter(Boolean)
        const topLeague = leagues.length > 0 ? leagues[0] : "N/A"

        setStats({ total, totalCoins, averageCoins, topLeague })
      }
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.telegram_id?.toLowerCase().includes(search.toLowerCase()),
  )

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getLeagueBadgeColor = (league: string) => {
    const colors = {
      Bronze: "bg-amber-600",
      Silver: "bg-gray-400",
      Gold: "bg-yellow-500",
      Platinum: "bg-cyan-400",
      Diamond: "bg-blue-500",
    }
    return colors[league as keyof typeof colors] || "bg-gray-500"
  }

  const handleBanToggle = async (user: any) => {
    setLoading(true)
    await supabase.from("users").update({ is_banned: !user.is_banned }).eq("id", user.id)
    // Listeyi güncelle
    const { data } = await supabase.from("users").select("*")
    setUsers(data || [])
    setLoading(false)
  }

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`${user.username || user.id} kullanıcısını silmek istediğine emin misin?`)) return
    setLoading(true)
    await supabase.from("users").delete().eq("id", user.id)
    const { data } = await supabase.from("users").select("*")
    setUsers(data || [])
    setLoading(false)
  }

  const handleOpenEditModal = (user: any) => {
    setEditUser(user)
    setEditCoins(user.coins || 0)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditUser(null)
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    setLoading(true)
    await supabase.from("users").update({ coins: editCoins }).eq("id", editUser.id)
    const { data } = await supabase.from("users").select("*")
    setUsers(data || [])
    setLoading(false)
    handleCloseEditModal()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
          <FontAwesomeIcon icon={icons.userGroup} className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Kullanıcılar</h1>
          <p className="text-gray-400">Kullanıcı yönetimi ve istatistikleri</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-blue-400">{formatNumber(stats.total)}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.userGroup} className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Toplam Coins</p>
              <p className="text-2xl font-bold text-yellow-400">{formatNumber(stats.totalCoins)}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.coins} className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Ortalama Coins</p>
              <p className="text-2xl font-bold text-green-400">{formatNumber(stats.averageCoins)}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.star} className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">En Yüksek Liga</p>
              <p className="text-2xl font-bold text-purple-400">{stats.topLeague}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.levelUp} className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Search */}
      <AdminCard title="Arama" description="Kullanıcı adı veya Telegram ID ile arama yapın">
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kullanıcı adı veya Telegram ID ile ara..."
        />
      </AdminCard>

      {/* Users Table */}
      <AdminCard title={`Kullanıcılar (${filtered.length})`} description="Tüm kullanıcıların detaylı listesi">
        <AdminTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Telegram ID</th>
              <th>Kullanıcı Adı</th>
              <th>Coins</th>
              <th>Liga</th>
              <th>Enerji</th>
              <th>Oluşturulma</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">Kullanıcı bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td className="font-mono text-xs">{u.id}</td>
                  <td className="font-mono">{u.telegram_id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {u.username ? u.username[0].toUpperCase() : "?"}
                        </span>
                      </div>
                      <span>{u.username || "N/A"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={icons.coins} className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{formatNumber(u.coins || 0)}</span>
                    </div>
                  </td>
                  <td>
                    {u.league ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getLeagueBadgeColor(u.league)}`}
                      >
                        {u.league}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={icons.bolt} className="h-4 w-4 text-blue-500" />
                      <span>{u.energy || 0}</span>
                    </div>
                  </td>
                  <td className="text-gray-400 text-sm">
                    {u.created_at ? new Date(u.created_at).toLocaleString("tr-TR") : "-"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleBanToggle(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${u.is_banned ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}`}
                    >
                      {u.is_banned ? "Banı Kaldır" : "Banla"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="ml-2 px-3 py-1 rounded-lg text-xs font-semibold bg-gray-700 text-white hover:bg-red-600 transition-all duration-200"
                    >
                      Sil
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="ml-2 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-all duration-200"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-8 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={handleCloseEditModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Kullanıcıyı Düzenle</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Altın (Coins)</label>
              <input
                type="number"
                value={editCoins}
                onChange={(e) => setEditCoins(Number(e.target.value))}
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-6 py-2 rounded bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
