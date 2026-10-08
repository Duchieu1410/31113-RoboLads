'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Plus, 
  Pencil, 
  Trash2, 
  LogOut, 
  Eye, 
  Download, 
  FileText, 
  Search,
  Lock,
  User,
  X
} from 'lucide-react';

const INITIAL_MOCK_RESOURCES = [
  { id: '1', title: 'CAD Model - Chassis Base v2', category: 'CAD', author: 'Chúc Anh Minh', views: 142, downloads: 45, date: '2026-10-02' },
  { id: '2', title: 'Autonomous Navigation Code', category: 'Programming', author: 'Chúc Anh Minh', views: 230, downloads: 89, date: '2026-10-05' },
  { id: '3', title: 'Gearbox Failure Analysis Log', category: 'Failure Log', author: 'Lê Nam Hưng', views: 98, downloads: 12, date: '2026-10-08' },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState(INITIAL_MOCK_RESOURCES);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', category: 'CAD', author: 'Nguyễn Việt Khang' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      setIsAuthenticated(true);
    } else {
      alert('Vui lòng nhập tài khoản và mật khẩu!');
    }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingResource(item);
      setFormData({ title: item.title, category: item.category, author: item.author });
    } else {
      setEditingResource(null);
      setFormData({ title: '', category: 'CAD', author: 'Nguyễn Việt Khang' });
    }
    setIsModalOpen(true);
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResource) {
      setResources(resources.map(r => r.id === editingResource.id ? { ...r, ...formData } : r));
    } else {
      const newResource = {
        id: Date.now().toString(),
        ...formData,
        views: 0,
        downloads: 0,
        date: new Date().toISOString().split('T')[0]
      };
      setResources([newResource, ...resources]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      setResources(resources.filter(r => r.id !== id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">RBL Team Admin Portal</h1>
            <p className="text-slate-400 text-sm">Đăng nhập để quản lý nội dung & tài nguyên</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tài khoản</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredResources = resources.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FolderKanban className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">RBL Admin</h2>
              <p className="text-xs text-slate-400">Nguyễn Việt Khang</p>
            </div>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('resources')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'resources' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <FileText className="h-5 w-5" /> Quản lý bài viết (CRUD)
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <LayoutDashboard className="h-5 w-5" /> Data Analytics
            </button>
          </nav>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg text-sm transition-colors"
        >
          <LogOut className="h-5 w-5" /> Đăng xuất
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'resources' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Resource Management</h1>
                <p className="text-slate-400 text-sm">Thêm, sửa, xóa các tài nguyên hiển thị trên trang public</p>
              </div>
              <button 
                onClick={() => handleOpenModal()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors"
              >
                <Plus className="h-4 w-4" /> Đăng bài mới
              </button>
            </div>

            <div className="mb-6 relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Tìm kiếm bài viết..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Tên bài viết / Tài nguyên</th>
                    <th className="px-6 py-4">Chuyên mục</th>
                    <th className="px-6 py-4">Tác giả</th>
                    <th className="px-6 py-4">Lượt xem</th>
                    <th className="px-6 py-4">Lượt tải</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredResources.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-xs text-blue-400">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.author}</td>
                      <td className="px-6 py-4">{item.views}</td>
                      <td className="px-6 py-4">{item.downloads}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenModal(item)} 
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400 text-sm mb-6">Thống kê dữ liệu lượt truy cập & lượt tải tài nguyên</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Tổng lượt xem</p>
                  <p className="text-3xl font-bold text-white mt-1">470</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Eye className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Tổng lượt tải</p>
                  <p className="text-3xl font-bold text-white mt-1">146</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Download className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Tổng bài viết</p>
                  <p className="text-3xl font-bold text-white mt-1">{resources.length}</p>
                </div>
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingResource ? 'Sửa bài viết' : 'Đăng bài viết mới'}
            </h2>
            <form onSubmit={handleSaveResource} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Tiêu đề bài viết</label>
                <input 
                  type="text" 
                  required
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Chuyên mục</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CAD">CAD</option>
                  <option value="Programming">Programming</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Failure Log">Failure Log</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Tác giả</label>
                <input 
                  type="text" 
                  value={formData.author} 
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg text-sm"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Lưu bài viết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}