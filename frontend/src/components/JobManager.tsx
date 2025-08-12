import React, { useState, useEffect } from 'react';
import JobDetailModal from './JobDetailModal';
const API_URL = 'http://localhost:5000/api/job';
const emptyJob = {
  title: '',
  description: '',
};

export default function JobManager({ user, onBack }: { user: any, onBack: () => void }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    title: '',
    salary: '',
    experienceLevel: '',
    jobType: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyJob, tags: [], jobType: '', experienceLevel: '' });

  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [viewJobId, setViewJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_URL}?page=${page}&pageSize=${pageSize}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải bài tuyển dụng');
      setJobs(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    setForm({ ...emptyJob, tags: [], jobType: '', experienceLevel: '' });
    setEditId(null);
    setShowForm(true);
    setMessage('');
  };

  const handleEdit = (job: any) => {
    setForm({ ...job, tags: Array.isArray(job.tags) ? job.tags : [], jobType: job.jobType || '', experienceLevel: job.experienceLevel || '' });
    setEditId(job._id);
    setShowForm(true);
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bài tuyển dụng này?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xóa bài tuyển dụng');
      setMessage('Đã xóa bài tuyển dụng!');
      fetchJobs();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Lỗi không xác định');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `${API_URL}/${editId}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi lưu bài tuyển dụng');
      setShowForm(false);
      setMessage(editId ? 'Đã cập nhật bài tuyển dụng!' : 'Đã tạo bài tuyển dụng mới!');
      fetchJobs();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Lỗi không xác định');
    }
  };

  // Lọc jobs theo filter
  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job =>
    (!filter.title || job.title?.toLowerCase().includes(filter.title.toLowerCase())) &&
    (!filter.salary || (job.salary || '').toLowerCase().includes(filter.salary.toLowerCase())) &&
    (!filter.experienceLevel || (job.experienceLevel || '').toLowerCase().includes(filter.experienceLevel.toLowerCase())) &&
    (!filter.jobType || (job.jobType || '').toLowerCase().includes(filter.jobType.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-2xl shadow-2xl border border-blue-200 animate-fade-in-down">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow flex items-center gap-2">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5m6 0v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
          Quản lý bài tuyển dụng
        </h2>
        <button aria-label="Quay lại" className="bg-gray-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-gray-900 transition" onClick={onBack}>Quay lại</button>
      </div>
      {message && <div className="mb-2 text-green-600 font-semibold animate-pulse">{message}</div>}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 font-semibold animate-pulse">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          Đang tải...
        </div>
      )}
      {error && <div className="text-red-600 font-semibold animate-pulse mb-2">{error}</div>}
      {!showForm && (
        <>
          <button aria-label="Tạo bài tuyển dụng mới" className="mb-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200" onClick={handleCreate}>Tạo bài tuyển dụng mới</button>
          {filteredJobs.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-2 text-gray-500 italic mt-8">
              <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
              Không có bài tuyển dụng nào phù hợp.
            </div>
          )}
          <ul>
            {(Array.isArray(filteredJobs) ? filteredJobs : []).map((job) => (
              <li key={job._id} className="border-b py-4 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-blue-50 rounded-lg transition group">
                <div className="flex-1">
                  <div className="font-semibold text-blue-700 text-lg mb-1 flex items-center gap-2">
                    {job.title}
                    {job.jobType && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700 border border-blue-300 shadow mr-2">
                        <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /></svg>
                        {job.jobType}
                      </span>
                    )}
                    {job.experienceLevel && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                        <svg className="w-3 h-3 mr-1 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 1" /></svg>
                        {job.experienceLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-1 line-clamp-2">{job.description}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                    <div><span className="font-semibold">Địa điểm:</span> {job.location || 'Không xác định'}</div>
                    <div><span className="font-semibold">Lương:</span> {job.salary || 'Thỏa thuận'}</div>
                    <div><span className="font-semibold">Hạn nộp:</span> {job.deadline || 'Không xác định'}</div>
                    <div><span className="font-semibold">Hình thức:</span> {job.jobType || 'Không xác định'}</div>
                    <div><span className="font-semibold">Kinh nghiệm:</span> {job.experienceLevel || 'Không yêu cầu'}</div>
                    <div><span className="font-semibold">Tags:</span> {job.tags?.length > 0 ? job.tags.join(', ') : 'Không có'}</div>
                    <div><span className="font-semibold">Liên hệ:</span> {job.contact || 'Không có'}</div>
                    <div><span className="font-semibold">Phúc lợi:</span> {job.benefits || 'Không có'}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button aria-label="Xem chi tiết" className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:scale-105 hover:bg-blue-700 transition-all duration-200" onClick={() => setViewJobId(job._id)}>Xem</button>
                  <button aria-label="Sửa" className="bg-yellow-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:scale-105 hover:bg-yellow-600 transition-all duration-200" onClick={() => handleEdit(job)}>Sửa</button>
                  <button aria-label="Xóa" className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:scale-105 hover:bg-red-700 transition-all duration-200" onClick={() => handleDelete(job._id)}>Xóa</button>
                </div>
              </li>
            ))}
          </ul>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                aria-label="Trang trước"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >Trước</button>
              <span className="text-sm font-semibold text-gray-700">
                Trang <span className="text-blue-600">{page}</span> / {totalPages}
              </span>
              <button
                aria-label="Trang sau"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >Sau</button>
            </div>
          )}
        </>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2 relative bg-white rounded-xl shadow-lg p-4 animate-fade-in-down">
          <button type="button" aria-label="Đóng" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold" onClick={() => setShowForm(false)}>&times;</button>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Chức danh" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" required />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả công việc" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" />
          <textarea name="requirements" value={form.requirements} onChange={handleChange} placeholder="Yêu cầu" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Địa điểm" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" />
          <input name="salary" value={form.salary} onChange={handleChange} placeholder="Lương" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" />
          <input name="deadline" value={form.deadline} onChange={handleChange} placeholder="Hạn nộp" type="date" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" />
          <input name="contact" value={form.contact} onChange={handleChange} placeholder="Liên hệ" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" />
          <input name="benefits" value={form.benefits} onChange={handleChange} placeholder="Phúc lợi" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" />
          <div className="flex gap-4">
            <div className="relative w-1/2">
              <select name="jobType" value={form.jobType} onChange={handleChange} className="pl-4 pr-8 py-3 border-2 border-blue-200 rounded-2xl w-full text-base focus:ring-4 focus:ring-blue-300 transition bg-white shadow-sm appearance-none hover:border-blue-400 hover:shadow-md cursor-pointer outline-none" required>
                <option value="">Chọn hình thức</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Intern">Intern</option>
                <option value="Remote">Remote</option>
                <option value="Freelance">Freelance</option>
              </select>
              <svg className="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div className="relative w-1/2">
              <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="pl-4 pr-8 py-3 border-2 border-blue-200 rounded-2xl w-full text-base focus:ring-4 focus:ring-blue-300 transition bg-white shadow-sm appearance-none hover:border-blue-400 hover:shadow-md cursor-pointer outline-none" required>
                <option value="">Chọn kinh nghiệm</option>
                <option value="Không yêu cầu">Không yêu cầu</option>
                <option value="Thực tập sinh">Thực tập sinh</option>
                <option value="Mới ra trường">Mới ra trường</option>
                <option value="1-2 năm">1-2 năm</option>
                <option value="3-5 năm">3-5 năm</option>
                <option value="Trên 5 năm">Trên 5 năm</option>
              </select>
              <svg className="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <input name="tags" value={form.tags?.join(', ')} onChange={e => setForm({ ...form, tags: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} placeholder="Tags (cách nhau bởi dấu phẩy)" className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" />
          <div className="flex gap-2">
            <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200">{editId ? 'Lưu thay đổi' : 'Tạo mới'}</button>
            <button type="button" className="bg-gray-400 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-gray-600 transition-all duration-200" onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        </form>
      )}
      {viewJobId && <JobDetailModal jobId={viewJobId} onClose={() => setViewJobId(null)} />}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
