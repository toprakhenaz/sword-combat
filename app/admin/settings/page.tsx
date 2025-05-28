"use client"
import { useEffect, useState } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [editSetting, setEditSetting] = useState<any | null>(null)
  const [form, setForm] = useState({ key: "", value: "", description: "" })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      const { data } = await supabase.from("app_settings").select("*")
      setSettings(data || [])
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const filtered = settings.filter(
    (s) => s.key?.toLowerCase().includes(search.toLowerCase()) || s.value?.toLowerCase().includes(search.toLowerCase()),
  )

  const resetForm = () => {
    setForm({ key: "", value: "", description: "" })
    setEditSetting(null)
    setShowForm(false)
  }

  const handleEdit = (setting: any) => {
    setEditSetting(setting)
    setForm({
      key: setting.key,
      value: setting.value,
      description: setting.description || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Ayar silinsin mi?")) return
    await supabase.from("app_settings").delete().eq("id", id)
    setSettings(settings.filter((s) => s.id !== id))
  }

  const handleUpdate = async () => {
    if (!editSetting) return
    await supabase.from("app_settings").update(form).eq("id", editSetting.id)
    setSettings(settings.map((s) => (s.id === editSetting.id ? { ...s, ...form } : s)))
    resetForm()
  }

  const handleAdd = async () => {
    const { data } = await supabase.from("app_settings").insert([form]).select().single()
    if (data) setSettings([data, ...settings])
    resetForm()
  }

  const getSettingIcon = (key: string) => {
    const keyIcons = {
      game: icons.play,
      coin: icons.coins,
      energy: icons.bolt,
      boost: icons.rocket,
      daily: icons.calendar,
      referral: icons.userGroup,
      limit: icons.filter,
      reward: icons.gift,
    }

    const foundIcon = Object.entries(keyIcons).find(([k]) => key?.toLowerCase().includes(k))

    return foundIcon ? foundIcon[1] : icons.filter
  }

  const getSettingColor = (key: string) => {
    const keyColors = {
      game: "text-blue-400 bg-blue-500/10",
      coin: "text-yellow-400 bg-yellow-500/10",
      energy: "text-cyan-400 bg-cyan-500/10",
      boost: "text-purple-400 bg-purple-500/10",
      daily: "text-green-400 bg-green-500/10",
      referral: "text-pink-400 bg-pink-500/10",
      limit: "text-red-400 bg-red-500/10",
      reward: "text-orange-400 bg-orange-500/10",
    }

    const foundColor = Object.entries(keyColors).find(([k]) => key?.toLowerCase().includes(k))

    return foundColor ? foundColor[1] : "text-gray-400 bg-gray-500/10"
  }

  const getValueType = (value: string) => {
    if (!isNaN(Number(value))) return "number"
    if (value === "true" || value === "false") return "boolean"
    try {
      JSON.parse(value)
      return "json"
    } catch {
      return "string"
    }
  }

  const formatValue = (value: string) => {
    const type = getValueType(value)
    switch (type) {
      case "number":
        return (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={icons.sort} className="h-3 w-3 text-blue-400" />
            <span className="font-mono text-blue-400">{value}</span>
          </div>
        )
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={value === "true" ? icons.check : icons.times}
              className={`h-3 w-3 ${value === "true" ? "text-green-400" : "text-red-400"}`}
            />
            <span className={`font-semibold ${value === "true" ? "text-green-400" : "text-red-400"}`}>
              {value === "true" ? "Aktif" : "Pasif"}
            </span>
          </div>
        )
      case "json":
        return (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={icons.filter} className="h-3 w-3 text-purple-400" />
            <span className="font-mono text-purple-400 text-xs">JSON</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={icons.bookOpen} className="h-3 w-3 text-gray-400" />
            <span className="text-gray-300">{value}</span>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl">
            <FontAwesomeIcon icon={icons.filter} className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Ayarlar</h1>
            <p className="text-gray-400">Uygulama ayarları yönetimi</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center gap-2 font-semibold"
        >
          <FontAwesomeIcon icon={icons.plus} className="h-4 w-4" />
          Yeni Ayar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Toplam Ayar</p>
              <p className="text-2xl font-bold text-gray-300">{settings.length}</p>
            </div>
            <div className="p-3 bg-gray-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.filter} className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Aktif Ayarlar</p>
              <p className="text-2xl font-bold text-green-400">{settings.filter((s) => s.value === "true").length}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.check} className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sayısal Ayarlar</p>
              <p className="text-2xl font-bold text-blue-400">
                {settings.filter((s) => !isNaN(Number(s.value))).length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FontAwesomeIcon icon={icons.sort} className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Search */}
      <AdminCard>
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Anahtar veya değer ile ara..."
        />
      </AdminCard>

      {/* Add/Edit Form */}
      {showForm && (
        <AdminCard
          title={editSetting ? "Ayar Düzenle" : "Yeni Ayar Ekle"}
          description={editSetting ? "Mevcut ayar bilgilerini güncelleyin" : "Yeni bir ayar oluşturun"}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Anahtar</label>
              <input
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200"
                placeholder="Ayar anahtarı"
                value={form.key}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Değer</label>
              <input
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200"
                placeholder="Ayar değeri"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Açıklama</label>
              <input
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200"
                placeholder="Ayar açıklaması (opsiyonel)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            {editSetting ? (
              <button
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center gap-2"
                onClick={handleUpdate}
              >
                <FontAwesomeIcon icon={icons.check} className="h-4 w-4" />
                Güncelle
              </button>
            ) : (
              <button
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center gap-2"
                onClick={handleAdd}
              >
                <FontAwesomeIcon icon={icons.plus} className="h-4 w-4" />
                Ekle
              </button>
            )}
            <button
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              onClick={resetForm}
            >
              <FontAwesomeIcon icon={icons.times} className="h-4 w-4" />
              İptal
            </button>
          </div>
        </AdminCard>
      )}

      {/* Settings Table */}
      <AdminCard title={`Ayarlar (${filtered.length})`} description="Tüm uygulama ayarlarının detaylı listesi">
        <AdminTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Anahtar</th>
              <th>Değer</th>
              <th>Açıklama</th>
              <th>Oluşturulma</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">Ayar bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-xs">{s.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getSettingColor(s.key)}`}>
                        <FontAwesomeIcon icon={getSettingIcon(s.key)} className="h-4 w-4" />
                      </div>
                      <span className="font-semibold font-mono">{s.key}</span>
                    </div>
                  </td>
                  <td>{formatValue(s.value)}</td>
                  <td className="max-w-xs">
                    <p className="truncate text-gray-400">{s.description || "-"}</p>
                  </td>
                  <td className="text-gray-400 text-sm">
                    {s.created_at ? new Date(s.created_at).toLocaleString("tr-TR") : "-"}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all duration-200 flex items-center gap-1"
                        onClick={() => handleEdit(s)}
                      >
                        <FontAwesomeIcon icon={icons.filter} className="h-3 w-3" />
                        <span className="text-xs font-semibold">Düzenle</span>
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 flex items-center gap-1"
                        onClick={() => handleDelete(s.id)}
                      >
                        <FontAwesomeIcon icon={icons.times} className="h-3 w-3" />
                        <span className="text-xs font-semibold">Sil</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </AdminCard>

      {/* Info Card */}
      <AdminCard
        title="Ayar Türleri"
        description="Farklı veri türlerinin nasıl tanımlandığı"
        className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={icons.sort} className="h-4 w-4 text-blue-400" />
              Sayısal
            </h4>
            <p className="text-sm text-gray-400">Sayısal değerler (1, 100, 500)</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={icons.check} className="h-4 w-4 text-green-400" />
              Boolean
            </h4>
            <p className="text-sm text-gray-400">Doğru/Yanlış (true, false)</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={icons.bookOpen} className="h-4 w-4 text-gray-400" />
              Metin
            </h4>
            <p className="text-sm text-gray-400">Metinsel değerler</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FontAwesomeIcon icon={icons.filter} className="h-4 w-4 text-purple-400" />
              JSON
            </h4>
            <p className="text-sm text-gray-400">Karmaşık veri yapıları</p>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}
