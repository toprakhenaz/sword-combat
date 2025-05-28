"use client"
import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      const { data } = await supabase.from("transactions").select("*")
      setTransactions(data || [])
      setLoading(false)
    }
    fetchTransactions()
  }, [])

  const filtered = transactions.filter(
    (t) => t.user_id?.toString().includes(search) || t.transaction_type?.toLowerCase().includes(search.toLowerCase()),
  )

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getTransactionTypeColor = (type: string) => {
    const colors = {
      earn: "bg-green-500/20 text-green-400",
      spend: "bg-red-500/20 text-red-400",
      reward: "bg-yellow-500/20 text-yellow-400",
      bonus: "bg-purple-500/20 text-purple-400",
      referral: "bg-blue-500/20 text-blue-400",
    }
    return colors[type?.toLowerCase() as keyof typeof colors] || "bg-gray-500/20 text-gray-400"
  }

  const getTransactionTypeIcon = (type: string) => {
    const typeIcons = {
      earn: icons.plus,
      spend: icons.arrowRight,
      reward: icons.gift,
      bonus: icons.star,
      referral: icons.userGroup,
    }
    return typeIcons[type?.toLowerCase() as keyof typeof typeIcons] || icons.arrowRight
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl">
          <FontAwesomeIcon icon={icons.arrowRight} className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">İşlemler</h1>
          <p className="text-gray-400">Finansal işlem kayıtları ve takibi</p>
        </div>
      </div>

      {/* Search */}
      <AdminCard>
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kullanıcı ID veya işlem türü ile ara..."
        />
      </AdminCard>

      {/* Transactions Table */}
      <AdminCard title={`İşlemler (${filtered.length})`} description="Tüm finansal işlemlerin detaylı listesi">
        <AdminTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kullanıcı ID</th>
              <th>Miktar</th>
              <th>İşlem Türü</th>
              <th>Açıklama</th>
              <th>Oluşturulma</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">İşlem kaydı bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs">{t.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={icons.userGroup} className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-mono">{t.user_id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={icons.coins} className="h-4 w-4 text-yellow-500" />
                      <span className={`font-semibold ${t.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                        {t.amount > 0 ? "+" : ""}
                        {formatNumber(t.amount || 0)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getTransactionTypeColor(t.transaction_type)}`}>
                        <FontAwesomeIcon icon={getTransactionTypeIcon(t.transaction_type)} className="h-3 w-3" />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getTransactionTypeColor(t.transaction_type)}`}
                      >
                        {t.transaction_type}
                      </span>
                    </div>
                  </td>
                  <td className="max-w-xs">
                    <p className="truncate text-gray-400">{t.description || "-"}</p>
                  </td>
                  <td className="text-gray-400 text-sm">
                    {t.created_at ? new Date(t.created_at).toLocaleString("tr-TR") : "-"}
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
