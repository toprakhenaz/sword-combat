"use client"
import type React from "react"
import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface ReferralForm {
  id?: number
  referrer_id: string
  referred_id: string
  reward_amount: number
  is_claimed: boolean
}

const emptyForm: ReferralForm = {
  referrer_id: "",
  referred_id: "",
  reward_amount: 0,
  is_claimed: false,
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editReferral, setEditReferral] = useState<ReferralForm | null>(null)
  const [form, setForm] = useState<ReferralForm>(emptyForm)

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    setLoading(true)
    const { data } = await supabase.from("referrals").select("*")
    setReferrals(data || [])
    setLoading(false)
  }

  const handleOpenModal = (referral?: any) => {
    if (referral) {
      setEditReferral(referral)
      setForm(referral)
    } else {
      setEditReferral(null)
      setForm(emptyForm)
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditReferral(null)
    setForm(emptyForm)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (editReferral) {
      await supabase.from("referrals").update(form).eq("id", editReferral.id)
    } else {
      await supabase.from("referrals").insert([form])
    }
    await fetchReferrals()
    handleCloseModal()
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Silmek istediğine emin misin?")) return
    setLoading(true)
    await supabase.from("referrals").delete().eq("id", id)
    await fetchReferrals()
    setLoading(false)
  }

  const filtered = referrals.filter(
    (r) => r.referrer_id?.toString().includes(search) || r.referred_id?.toString().includes(search),
  )

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl">
          <FontAwesomeIcon icon={icons.userGroup} className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Referanslar</h1>
          <p className="text-gray-400">Referans sistemi yönetimi ve takibi</p>
        </div>
      </div>

      {/* Search */}
      <AdminCard>
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Referrer veya Referred ID ile ara..."
        />
      </AdminCard>

      {/* Referrals Table */}
      <AdminCard title={`Referanslar (${filtered.length})`} description="Tüm referans kayıtlarının detaylı listesi">
        <AdminTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Referrer ID</th>
              <th>Referred ID</th>
              <th>Ödül Miktarı</th>
              <th>Alındı mı?</th>
              <th>Oluşturulma</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">Referans kaydı bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={icons.userGroup} className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-mono">{r.referrer_id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={icons.userGroup} className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-mono">{r.referred_id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={icons.coins} className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{formatNumber(r.reward_amount || 0)}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        r.is_claimed ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {r.is_claimed ? (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={icons.check} className="h-3 w-3" />
                          <span>Evet</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={icons.clock} className="h-3 w-3" />
                          <span>Hayır</span>
                        </div>
                      )}
                    </span>
                  </td>
                  <td className="text-gray-400 text-sm">
                    {r.created_at ? new Date(r.created_at).toLocaleString("tr-TR") : "-"}
                  </td>
                  <td>
                    <button onClick={() => handleOpenModal(r)} className="text-yellow-400 hover:underline mr-2">
                      Düzenle
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:underline">
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-8 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">{editReferral ? "Referansı Düzenle" : "Yeni Referans Ekle"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Referrer ID</label>
                <input
                  name="referrer_id"
                  value={form.referrer_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Referred ID</label>
                <input
                  name="referred_id"
                  value={form.referred_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ödül Miktarı</label>
                <input
                  name="reward_amount"
                  type="number"
                  value={form.reward_amount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_claimed" checked={form.is_claimed} onChange={handleChange} />
                <label className="text-sm">Alındı mı?</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
                >
                  {editReferral ? "Kaydet" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
