"use client"
import type React from "react"
import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

interface TaskForm {
  id?: number
  title: string
  description: string
  reward: number
  category: string
  platform: string
  link: string
}

const emptyForm: TaskForm = {
  title: "",
  description: "",
  reward: 0,
  category: "",
  platform: "",
  link: "",
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<TaskForm | null>(null)
  const [form, setForm] = useState<TaskForm>(emptyForm)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    const { data } = await supabase.from("tasks").select("*")
    setTasks(data || [])
    setLoading(false)
  }

  const handleOpenModal = (task?: any) => {
    if (task) {
      setEditTask(task)
      setForm(task)
    } else {
      setEditTask(null)
      setForm(emptyForm)
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditTask(null)
    setForm(emptyForm)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (editTask) {
      await supabase.from("tasks").update(form).eq("id", editTask.id)
    } else {
      await supabase.from("tasks").insert([form])
    }
    await fetchTasks()
    handleCloseModal()
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Silmek istediğine emin misin?")) return
    setLoading(true)
    await supabase.from("tasks").delete().eq("id", id)
    await fetchTasks()
    setLoading(false)
  }

  const filtered = tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()),
  )

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getPlatformIcon = (platform: string) => {
    const platformIcons = {
      youtube: icons.youtube,
      twitter: icons.twitter,
      telegram: icons.telegram,
      instagram: icons.instagram,
      facebook: icons.facebook,
      linkedin: icons.linkedin,
    }
    return platformIcons[platform?.toLowerCase() as keyof typeof platformIcons] || icons.globe
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      youtube: "text-red-400 bg-red-500/10",
      twitter: "text-blue-400 bg-blue-500/10",
      telegram: "text-cyan-400 bg-cyan-500/10",
      instagram: "text-pink-400 bg-pink-500/10",
      facebook: "text-blue-600 bg-blue-600/10",
      linkedin: "text-blue-500 bg-blue-500/10",
    }
    return colors[platform?.toLowerCase() as keyof typeof colors] || "text-gray-400 bg-gray-500/10"
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      social: "bg-purple-500/20 text-purple-400",
      daily: "bg-green-500/20 text-green-400",
      special: "bg-yellow-500/20 text-yellow-400",
      referral: "bg-blue-500/20 text-blue-400",
    }
    return colors[category?.toLowerCase() as keyof typeof colors] || "bg-gray-500/20 text-gray-400"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
          <FontAwesomeIcon icon={icons.listCheck} className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Görevler</h1>
          <p className="text-gray-400">Oyun içi görev yönetimi</p>
        </div>
        {/* Görev Ekle Butonu */}
        <button
          className="ml-auto px-4 py-2 rounded bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition"
          onClick={() => handleOpenModal(null)}
        >
          + Görev Ekle
        </button>
      </div>

      {/* Search */}
      <AdminCard>
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Görev adı veya açıklama ile ara..."
        />
      </AdminCard>

      {/* Tasks Table */}
      <AdminCard title={`Görevler (${filtered.length})`} description="Tüm görevlerin detaylı listesi">
        <AdminTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Başlık</th>
              <th>Açıklama</th>
              <th>Kategori</th>
              <th>Ödül</th>
              <th>Platform</th>
              <th>Oluşturulma</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">Görev bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs">{t.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FontAwesomeIcon icon={icons.listCheck} className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="font-semibold">{t.title}</span>
                    </div>
                  </td>
                  <td className="max-w-xs">
                    <p className="truncate text-gray-400">{t.description}</p>
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(t.category)}`}>
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={icons.coins} className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{formatNumber(t.reward || 0)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getPlatformColor(t.platform)}`}>
                        <FontAwesomeIcon icon={getPlatformIcon(t.platform)} className="h-4 w-4" />
                      </div>
                      <span className="text-sm capitalize">{t.platform}</span>
                    </div>
                  </td>
                  <td className="text-gray-400 text-sm">
                    {t.created_at ? new Date(t.created_at).toLocaleString("tr-TR") : "-"}
                  </td>
                  <td>
                    <button onClick={() => handleOpenModal(t)} className="text-yellow-400 hover:underline mr-2">
                      Düzenle
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:underline">
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
            <h3 className="text-xl font-bold mb-4">{editTask ? "Görevi Düzenle" : "Yeni Görev Ekle"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlık</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
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
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ödül</label>
                <input
                  name="reward"
                  type="number"
                  value={form.reward}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <input
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link</label>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleChange}
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
                  {editTask ? "Kaydet" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
