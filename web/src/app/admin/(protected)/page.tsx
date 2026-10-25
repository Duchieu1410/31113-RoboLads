'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { blocksToText } from '@/lib/portableText';
import type { Resource, AnalyticsSummary } from '@/lib/queries';

const CATEGORIES = ['CAD', 'Programming', 'Mechanical', 'Failure Log'];

interface FormState {
  title: string;
  category: string;
  author: string;
  tags: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  category: 'CAD',
  author: 'Nguyễn Việt Khang',
  tags: '',
  description: '',
};

export default function AdminPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'resources' | 'analytics'>('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [removeFile, setRemoveFile] = useState(false);

  // Gọi API admin; nếu hết phiên (401) thì đưa về trang login.
  const adminFetch = useCallback(
    async (url: string, init?: RequestInit) => {
      const res = await fetch(url, init);
      if (res.status === 401) {
        router.push('/admin/login');
        throw new Error('Phiên đăng nhập đã hết hạn.');
      }
      return res;
    },
    [router]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    setAnalyticsError('');

    const [resList, resStats] = await Promise.allSettled([
      adminFetch('/api/admin/resources').then((r) => r.json()),
      adminFetch('/api/admin/analytics').then((r) => r.json()),
    ]);

    if (resList.status === 'fulfilled' && resList.value?.success) {
      setResources(resList.value.data as Resource[]);
    } else {
      setLoadError(
        resList.status === 'fulfilled'
          ? resList.value?.error || 'Không tải được danh sách bài viết.'
          : String(resList.reason?.message ?? resList.reason)
      );
    }

    if (resStats.status === 'fulfilled' && resStats.value?.success) {
      setAnalytics(resStats.value.data as AnalyticsSummary);
    } else {
      setAnalyticsError(
        resStats.status === 'fulfilled'
          ? resStats.value?.error || 'Không tải được analytics.'
          : String(resStats.reason?.message ?? resStats.reason)
      );
    }

    setLoading(false);
  }, [adminFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ghép lượt xem / lượt tải (từ analytics) vào từng resource theo _id.
  const statsById = useMemo(() => {
    const map = new Map<string, { views: number; downloads: number }>();
    analytics?.byResource?.forEach((r) =>
      map.set(r.resourceId, { views: r.views, downloads: r.downloads })
    );
    return map;
  }, [analytics]);

  const filteredResources = useMemo(
    () => resources.filter((r) => r.title?.toLowerCase().includes(searchTerm.toLowerCase())),
    [resources, searchTerm]
  );

  const chartData = useMemo(
    () =>
      [...(analytics?.byResource ?? [])]
        .sort((a, b) => b.views + b.downloads - (a.views + a.downloads))
        .slice(0, 10)
        .map((r) => ({
          name: (r.title ?? 'Untitled').length > 18 ? (r.title ?? '').slice(0, 17) + '…' : r.title ?? 'Untitled',
          Views: r.views,
          Downloads: r.downloads,
        })),
    [analytics]
  );

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleOpenModal = (item: Resource | null = null) => {
    setEditingResource(item);
    setFile(null);
    setRemoveFile(false);
    setForm(
      item
        ? {
            title: item.title ?? '',
            category: item.category ?? 'CAD',
            author: item.author ?? '',
            tags: (item.tags ?? []).join(', '),
            description: blocksToText(item.description),
          }
        : EMPTY_FORM
    );
    setIsModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const body = new FormData();
      body.set('title', form.title);
      body.set('category', form.category);
      body.set('author', form.author);
      body.set('tags', form.tags);
      body.set('description', form.description);
      if (file) body.set('file', file);
      if (removeFile) body.set('removeFile', 'true');

      // Không tự đặt Content-Type: trình duyệt sẽ thêm boundary cho multipart.
      const res = await adminFetch(
        editingResource ? `/api/admin/resources/${editingResource._id}` : '/api/admin/resources',
        { method: editingResource ? 'PUT' : 'POST', body }
      );
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Không thể lưu bài viết!');

      setIsModalOpen(false);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Đã có lỗi xảy ra khi lưu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Resource) => {
    if (!window.confirm(`Xóa "${item.title}"? Các lượt xem/tải của bài này cũng sẽ bị xóa.`)) return;

    try {
      const res = await adminFetch(`/api/admin/resources/${item._id}`, { method: 'DELETE' });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Không thể xóa bài viết từ hệ thống.');
      setResources((prev) => prev.filter((r) => r._id !== item._id));
      loadData();
    } catch (error: any) {
      alert(error.message || 'Lỗi khi xóa bài viết.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
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
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg text-sm transition-colors"
        >
          <LogOut className="h-5 w-5" /> Đăng xuất
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading && (
          <div className="mb-4 flex items-center text-slate-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang tải dữ liệu...
          </div>
        )}
        {loadError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-400 text-sm rounded-lg flex items-center justify-between">
            <span>{loadError}</span>
            <button onClick={loadData} className="flex items-center gap-1 underline">
              <RefreshCw className="h-4 w-4" /> Thử lại
            </button>
          </div>
        )}

        {activeTab === 'resources' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Resource Management</h1>
                <p className="text-slate-400 text-sm">
                  Thêm, sửa, xóa các tài nguyên hiển thị trên trang public
                </p>
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
                    <th className="px-6 py-4">File</th>
                    <th className="px-6 py-4">Lượt xem</th>
                    <th className="px-6 py-4">Lượt tải</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredResources.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        {loading ? 'Đang tải...' : 'Chưa có dữ liệu bài viết'}
                      </td>
                    </tr>
                  ) : (
                    filteredResources.map((item) => {
                      const stats = statsById.get(item._id);
                      return (
                        <tr key={item._id} className="hover:bg-slate-800/50">
                          <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-xs text-blue-400">
                              {item.category || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">{item.author || '—'}</td>
                          <td className="px-6 py-4 text-xs">
                            {item.file?.asset?.originalFilename || '—'}
                          </td>
                          <td className="px-6 py-4">{stats?.views ?? 0}</td>
                          <td className="px-6 py-4">{stats?.downloads ?? 0}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenModal(item)}
                              aria-label="Sửa"
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              aria-label="Xóa"
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
                <p className="text-slate-400 text-sm">Thống kê lượt truy cập & lượt tải tài nguyên</p>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg px-3 py-2"
              >
                <RefreshCw className="h-4 w-4" /> Làm mới
              </button>
            </div>

            {analyticsError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500 text-red-400 text-sm rounded-lg">
                {analyticsError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <KpiCard label="Tổng lượt xem" value={analytics?.totalViews ?? 0} tone="blue" icon={<Eye className="h-6 w-6" />} />
              <KpiCard label="Tổng lượt tải" value={analytics?.totalDownloads ?? 0} tone="emerald" icon={<Download className="h-6 w-6" />} />
              <KpiCard label="Tổng bài viết" value={resources.length} tone="purple" icon={<FileText className="h-6 w-6" />} />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
              <h2 className="font-bold text-white mb-4">Lượt xem & lượt tải theo tài nguyên (top 10)</h2>
              {chartData.length === 0 ? (
                <p className="text-slate-500 text-sm">Chưa có dữ liệu để vẽ biểu đồ.</p>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                      <Legend />
                      <Bar dataKey="Views" fill="#3b82f6" />
                      <Bar dataKey="Downloads" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <TopList title="Top 5 xem nhiều nhất" items={(analytics?.topViewed ?? []).map((i) => ({ id: i.resourceId, title: i.title, count: i.views }))} unit="lượt xem" />
              <TopList title="Top 5 tải nhiều nhất" items={(analytics?.topDownloaded ?? []).map((i) => ({ id: i.resourceId, title: i.title, count: i.downloads }))} unit="lượt tải" />
            </div>
          </div>
        )}
      </main>

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Đóng"
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingResource ? 'Sửa bài viết' : 'Đăng bài viết mới'}
            </h2>
            <form onSubmit={handleSaveResource} className="space-y-4">
              <Field label="Tiêu đề bài viết">
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Chuyên mục">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tác giả">
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Tags (cách nhau bằng dấu phẩy)">
                <input
                  type="text"
                  placeholder="FIRST Tech Challenge, mecanum"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Mô tả (để trống 1 dòng giữa các đoạn)">
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="File đính kèm">
                {editingResource?.file?.asset?.originalFilename && !removeFile && (
                  <p className="text-xs text-slate-400 mb-2">
                    Hiện tại: {editingResource.file.asset.originalFilename}{' '}
                    <button type="button" onClick={() => setRemoveFile(true)} className="text-red-400 underline ml-2">
                      Gỡ file
                    </button>
                  </p>
                )}
                {removeFile && <p className="text-xs text-amber-400 mb-2">File hiện tại sẽ bị gỡ khi lưu.</p>}
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-white"
                />
                <p className="text-xs text-slate-500 mt-1">Chọn file mới sẽ thay file cũ. Tối đa 100MB.</p>
              </Field>
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
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium flex items-center"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isSubmitting ? 'Đang lưu...' : 'Lưu bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  'w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: 'blue' | 'emerald' | 'purple';
  icon: React.ReactNode;
}) {
  const toneCls = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }[tone];
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${toneCls}`}>{icon}</div>
    </div>
  );
}

function TopList({
  title,
  items,
  unit,
}: {
  title: string;
  items: { id: string; title?: string; count: number }[];
  unit: string;
}) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="font-bold text-white mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">Chưa có dữ liệu.</p>
      ) : (
        <ul className="divide-y divide-slate-800">
          {items.map((it, idx) => (
            <li key={it.id} className="py-3 flex justify-between items-center text-sm">
              <span className="text-slate-200">
                <strong className="text-slate-500 mr-2">#{idx + 1}</strong>
                {it.title || 'Untitled'}
              </span>
              <span className="text-slate-300">
                {it.count} {unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
