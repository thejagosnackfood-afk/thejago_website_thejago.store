import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Bell,
  Search,
  Plus,
  MoreVertical,
  TrendingUp
} from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white hidden lg:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-black italic text-primary">JAGO ADMIN</h2>
        </div>
        <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 text-primary">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-bold text-sm">Dashboard</span>
          </div>
          <div className="hover:bg-white/5 rounded-lg p-3 flex items-center gap-3 text-gray-400 transition-colors cursor-pointer">
            <Package className="w-5 h-5" />
            <span className="font-bold text-sm">Produk</span>
          </div>
          <div className="hover:bg-white/5 rounded-lg p-3 flex items-center gap-3 text-gray-400 transition-colors cursor-pointer">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold text-sm">Pesanan</span>
          </div>
          <div className="hover:bg-white/5 rounded-lg p-3 flex items-center gap-3 text-gray-400 transition-colors cursor-pointer">
            <Users className="w-5 h-5" />
            <span className="font-bold text-sm">Pelanggan</span>
          </div>
          <div className="mt-auto hover:bg-white/5 rounded-lg p-3 flex items-center gap-3 text-gray-400 transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
            <span className="font-bold text-sm">Pengaturan</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari pesanan, produk..." 
              className="w-full bg-gray-100 border-none rounded-lg py-2 pl-10 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-black text-secondary text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Dashboard Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl font-black text-gray-900 italic uppercase">Ringkasan Dashboard</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Selamat datang kembali, Administrator Jago Store.</p>
            </div>
            <button className="bg-primary hover:bg-primary-dark text-secondary px-4 py-2 rounded-lg font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> TAMBAH PRODUK
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">+12.5%</span>
              </div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Penjualan</p>
              <h3 className="text-2xl font-black italic text-secondary">Rp 124.500.000</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-lg">-2.4%</span>
              </div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Pesanan Baru</p>
              <h3 className="text-2xl font-black italic text-secondary">156</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">+8.1%</span>
              </div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Pelanggan</p>
              <h3 className="text-2xl font-black italic text-secondary">2,450</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Stok Produk</p>
              <h3 className="text-2xl font-black italic text-secondary">420</h3>
            </div>
          </div>

          {/* Product Table Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black italic uppercase text-secondary">Produk Terbaru</h3>
              <button className="text-gray-400 hover:text-secondary transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          <img src={`/sample-photo/banner (${(i % 3) + 1}).jpg`} alt="Prod" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-sm text-gray-700">Produk Jago #{i}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">Retail Sembako</td>
                    <td className="px-6 py-4 text-sm font-bold text-secondary italic">Rp 45.000</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">In Stock</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-300 group-hover:text-secondary transition-colors font-bold text-xs">EDIT</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
