"use client"
import type React from "react"
import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface League {
  id: number
  name: string
  color: string
  image: string
  description: string
  coin_requirement?: number
  created_at?: string
  updated_at?: string
}

interface LeagueForm {
  id?: number
  name: string
  color: string
  image: string
  description: string
}

const emptyForm: LeagueForm = {
  name: "",
  color: "#888888",
  image: "",
  description: "",
}

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editLeague, setEditLeague] = useState<LeagueForm | null>(null)
  const [form, setForm] = useState<LeagueForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    setLoading(true)
    const { data } = await supabase.from("leagues").select("*").order("id")
    if (data) {
      const typedLeagues: League[] = data.map((league) => ({
        id: Number(league.id),
        name: String(league.name),
        color: String(league.color),
        image: String(league.image),
        description: String(league.description),
        coin_requirement: league.coin_requirement ? Number(league.coin_requirement) : undefined,
        created_at: league.created_at ? String(league.created_at) : undefined,
        updated_at: league.updated_at ? String(league.updated_at) : undefined,
      }))
      setLeagues(typedLeagues)
    } else {
      setLeagues([])
    }
    setLoading(false)
  }

  const handleOpenModal = (league?: League) => {
    if (league) {
      const { id, name, color, image, description } = league
      setEditLeague({ id, name, color, image, description })
      setForm({ id, name, color, image, description })
      setImageFile(null)
    } else {
      setEditLeague(null)
      setForm(emptyForm)
      setImageFile(null)
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditLeague(null)
    setForm(emptyForm)
    setImageFile(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const uploadImage = async (file: File) => {
    const fileName = `league_${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from("public").upload(`leagues/${fileName}`, file, { upsert: true })
    if (error) throw error
    return `/leagues/${fileName}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let imageUrl = form.image
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile)
      } catch (err) {
        alert("Resim yüklenemedi")
        setLoading(false)
        return
      }
    }
    const payload = { ...form, image: imageUrl }
    if (editLeague) {
      await supabase.from("leagues").update(payload).eq("id", editLeague.id!)
    } else {
      await supabase.from("leagues").insert([payload])
    }
    await fetchLeagues()
    handleCloseModal()
    setLoading(false)
  }

  const handleDeleteLeague = async (leagueId: number) => {
    if (!confirm("Are you sure you want to delete this league?")) return

    try {
      const { error } = await supabase.from("leagues").delete().eq("id", leagueId)

      if (error) throw error

      // Remove from local state
      setLeagues((prevLeagues) => prevLeagues.filter((l) => l.id !== leagueId))
    } catch (error) {
      console.error("Error deleting league:", error)
      alert("Failed to delete league")
    }
  }

  const filtered = leagues.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
          <FontAwesomeIcon icon={icons.trophy} className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Ligler</h1>
          <p className="text-gray-400">Oyun ligleri yönetimi</p>
        </div>
      </div>

      {/* Search & Add */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <AdminCard className="flex-1">
          <AdminSearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lig adı veya açıklama ile ara..."
          />
        </AdminCard>
        <button
          onClick={() => handleOpenModal()}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-xl shadow transition"
        >
          + Yeni Lig
        </button>
      </div>

      {/* Leagues Table */}
      <AdminCard title={`Ligler (${filtered.length})`} description="Tüm liglerin detaylı listesi">
        <AdminTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>İsim</th>
              <th>Renk</th>
              <th>Resim</th>
              <th>Açıklama</th>
              <th>Oluşturulma</th>
              <th>İşlemler</th>
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
                    <span className="text-gray-400">Lig bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id}>
                  <td className="font-mono text-xs">{l.id}</td>
                  <td className="font-semibold">{l.name}</td>
                  <td>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: l.color, color: "#fff" }}
                    >
                      {l.color}
                    </span>
                  </td>
                  <td>
                    {l.image ? (
                      <img
                        src={l.image.startsWith("http") ? l.image : "/leagues/" + l.image}
                        alt={l.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-700"
                      />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="max-w-xs">
                    <span className="truncate text-gray-400">{l.description}</span>
                  </td>
                  <td className="text-gray-400 text-sm">
                    {l.created_at ? new Date(l.created_at).toLocaleString("tr-TR") : "-"}
                  </td>
                  <td>
                    <button onClick={() => handleOpenModal(l)} className="text-yellow-400 hover:underline mr-2">
                      Düzenle
                    </button>
                    <button onClick={() => handleDeleteLeague(l.id)} className="text-red-400 hover:underline">
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
            <h3 className="text-xl font-bold mb-4">{editLeague ? "Ligi Düzenle" : "Yeni Lig Ekle"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">İsim</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Renk</label>
                <input
                  name="color"
                  type="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-16 h-10 p-0 border-none bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resim (URL veya yükle)</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="URL veya dosya yükle"
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white mb-2"
                />
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                <div className="mt-2 flex items-center gap-3">
                  {imageFile || form.image ? (
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : form.image.startsWith("http")
                            ? form.image
                            : `/leagues/${form.image}`
                      }
                      alt="Önizleme"
                      className="w-16 h-16 rounded object-cover border border-gray-700"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">Önizleme yok</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
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
                  {editLeague ? "Kaydet" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
