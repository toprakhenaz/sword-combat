import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import AdminCard from "@/components/admin/AdminCard"

const adminTabs = [
  {
    key: "users",
    label: "Kullanıcılar",
    href: "/admin/users",
    icon: icons.userGroup,
    description: "Kullanıcı yönetimi ve istatistikleri",
    color: "from-blue-500 to-blue-600",
  },
  {
    key: "items",
    label: "Itemlar",
    href: "/admin/items",
    icon: icons.coins,
    description: "Oyun içi item yönetimi",
    color: "from-green-500 to-green-600",
  },
  {
    key: "boosts",
    label: "Boostlar",
    href: "/admin/boosts",
    icon: icons.rocket,
    description: "Kullanıcı boost seviyelerini yönetin",
    color: "from-purple-500 to-purple-600",
  },
  {
    key: "tasks",
    label: "Görevler",
    href: "/admin/tasks",
    icon: icons.listCheck,
    description: "Oyun içi görev yönetimi",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    key: "daily",
    label: "Günlük Ödül",
    href: "/admin/daily",
    icon: icons.calendar,
    description: "Günlük ödül sistemi yönetimi",
    color: "from-orange-500 to-orange-600",
  },
  {
    key: "combo",
    label: "Combo",
    href: "/admin/combo",
    icon: icons.star,
    description: "Günlük kart kombosu yönetimi",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    key: "referrals",
    label: "Referanslar",
    href: "/admin/referrals",
    icon: icons.userGroup,
    description: "Referans sistemi yönetimi",
    color: "from-pink-500 to-pink-600",
  },
  {
    key: "transactions",
    label: "İşlemler",
    href: "/admin/transactions",
    icon: icons.arrowRight,
    description: "Finansal işlem kayıtları",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    key: "settings",
    label: "Ayarlar",
    href: "/admin/settings",
    icon: icons.filter,
    description: "Uygulama ayarları yönetimi",
    color: "from-gray-500 to-gray-600",
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl mb-6">
          <FontAwesomeIcon icon={icons.userGroup} className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-4">
          Admin Dashboard
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Yönetim paneline hoş geldiniz. Aşağıdaki modüllerden istediğinizi seçerek yönetim işlemlerinizi
          gerçekleştirebilirsiniz.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Aktif Modüller</p>
              <p className="text-3xl font-bold text-blue-400">{adminTabs.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FontAwesomeIcon icon={icons.filter} className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sistem Durumu</p>
              <p className="text-3xl font-bold text-green-400">Aktif</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <FontAwesomeIcon icon={icons.check} className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Dashboard Versiyonu</p>
              <p className="text-3xl font-bold text-purple-400">v2.0</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <FontAwesomeIcon icon={icons.rocket} className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Admin Modules */}
      <AdminCard title="Yönetim Modülleri" description="Mevcut tüm yönetim araçlarına buradan erişebilirsiniz">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTabs.map((tab) => (
            <Link key={tab.key} href={tab.href} className="group">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 bg-gradient-to-r ${tab.color} rounded-xl group-hover:scale-110 transition-transform duration-200`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-200">
                      {tab.label}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{tab.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                  <span className="text-xs text-gray-500">Yönetim Modülü</span>
                  <FontAwesomeIcon
                    icon={icons.arrowRight}
                    className="h-4 w-4 text-gray-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-200"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </AdminCard>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-800/50">
        <p className="text-gray-500 text-sm">Admin Dashboard v2.0 • Modern Yönetim Paneli</p>
      </div>
    </div>
  )
}
