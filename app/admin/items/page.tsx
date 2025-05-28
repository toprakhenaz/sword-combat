"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import AdminCard from "@/components/admin/AdminCard"
import AdminTable from "@/components/admin/AdminTable"
import AdminSearchInput from "@/components/admin/AdminSearchInput"
import { supabase } from "@/lib/supabase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import Image from "next/image"

interface Item {
  id: number
  name: string
  description: string
  image: string
  color: string
  created_at?: string
  updated_at?: string
}

interface ItemForm {
  id?: number
  name: string
  description: string
  image: string
  color: string
}

const emptyForm: ItemForm = {
  name: "",
  description: "",
  image: "",
  color: "#ffffff",
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<ItemForm | null>(null)
  const [form, setForm] = useState<ItemForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase.from("items").select("*").order("id")
    if (data) {
      const typedItems: Item[] = data.map((item) => ({
        id: Number(item.id),
        name: String(item.name),
        description: String(item.description),
        image: String(item.image),
        color: String(item.color || "#ffffff"),
        created_at: item.created_at ? String(item.created_at) : undefined,
        updated_at: item.updated_at ? String(item.updated_at) : undefined,
      }))
      setItems(typedItems)
    } else {
      setItems([])
    }
    setLoading(false)
  }

  const handleOpenModal = (item?: Item) => {
    if (item) {
      const { id, name, description, image, color } = item
      setEditItem({ id, name, description, image, color })
      setForm({ id, name, description, image, color })
      setImageFile(null)
    } else {
      setEditItem(null)
      setForm(emptyForm)
      setImageFile(null)
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditItem(null)
    setForm(emptyForm)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload-equipment", {
      method: "POST",
      headers: { "x-admin-auth": process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "" },
      body: formData,
    })
    const data = await res.json()
    if (data.success) {
      setForm((prev) => ({ ...prev, image: data.url }))
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = form.image

      // Upload image if there's a new file
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage.from("items").upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("items").getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      const itemData = {
        name: form.name,
        description: form.description,
        image: imageUrl,
        color: form.color,
      }

      if (editItem?.id) {
        const { error } = await supabase
          .from("items")
          .update(itemData as Record<string, unknown>)
          .eq("id", editItem.id)

        if (error) throw error

        // Update local state
        setItems((prevItems) => prevItems.map((item) => (item.id === editItem.id ? { ...item, ...itemData } : item)))
      } else {
        const { error, data } = await supabase
          .from("items")
          .insert([itemData as Record<string, unknown>])
          .select()

        if (error) throw error
        if (data) {
          const newItem = data[0] as unknown as Item
          setItems((prevItems) => [...prevItems, newItem])
        }
      }

      setModalOpen(false)
      setForm(emptyForm)
      setImageFile(null)
    } catch (error) {
      console.error("Error saving item:", error)
      alert("Failed to save item")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const { error } = await supabase.from("items").delete().eq("id", itemId)

      if (error) throw error

      // Remove from local state
      setItems((prevItems) => prevItems.filter((i) => i.id !== itemId))
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Failed to delete item")
    }
  }

  const filtered = items.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase()),
  )

  // Sıralama fonksiyonu
  const sortedItems = [...filtered].sort((a, b) => {
    if (sortOrder === "asc") return a.id - b.id
    return b.id - a.id
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
            <FontAwesomeIcon icon={icons.coins} className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Itemlar</h1>
            <p className="text-gray-400">Oyun içi item yönetimi</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 font-semibold"
        >
          <FontAwesomeIcon icon={icons.plus} className="h-4 w-4" />
          Yeni Item
        </button>
      </div>

      {/* Search */}
      <AdminCard>
        <AdminSearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Item adı veya açıklama ile ara..."
        />
      </AdminCard>

      {/* Items Table */}
      <AdminCard title={`Itemlar (${filtered.length})`} description="Tüm itemların detaylı listesi">
        <AdminTable>
          <thead>
            <tr>
              <th
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="cursor-pointer select-none"
              >
                ID {sortOrder === "asc" ? "▲" : "▼"}
              </th>
              <th>Resim</th>
              <th>Ad</th>
              <th>Renk</th>
              <th>Açıklama</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                    <span className="text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : sortedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon icon={icons.search} className="h-8 w-8 text-gray-500" />
                    <span className="text-gray-400">Item bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              sortedItems.map((i) => (
                <tr key={i.id}>
                  <td className="font-mono text-xs">{i.id}</td>
                  <td>
                    {i.image ? (
                      <Image
                        src={i.image || "/placeholder.svg"}
                        alt={i.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain rounded"
                      />
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td>
                    <span className="font-semibold">{i.name}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-600"
                        style={{ backgroundColor: i.color || "#ffffff" }}
                      ></div>
                      <span className="text-xs font-mono">{i.color || "#ffffff"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-300 truncate max-w-[200px] block">{i.description || "-"}</span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all duration-200 flex items-center gap-1"
                        onClick={() => handleOpenModal(i)}
                      >
                        <FontAwesomeIcon icon={icons.filter} className="h-3 w-3" />
                        <span className="text-xs font-semibold">Düzenle</span>
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 flex items-center gap-1"
                        onClick={() => handleDeleteItem(i.id)}
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
            <h3 className="text-xl font-bold mb-4">{editItem ? "Itemı Düzenle" : "Yeni Item Ekle"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ad</label>
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
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="#ffffff"
                    className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resim</label>
                <div className="flex items-center gap-4">
                  {form.image && (
                    <>
                      <Image
                        src={form.image || "/placeholder.svg"}
                        alt="item"
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                        className="text-xs text-red-400 underline ml-2"
                      >
                        Resmi Kaldır
                      </button>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="block"
                  />
                  {uploading && <span className="text-xs text-yellow-400 ml-2">Yükleniyor...</span>}
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
                  {editItem ? "Kaydet" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
