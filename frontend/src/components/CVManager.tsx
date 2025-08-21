import React, { useState, useEffect } from 'react';
import CVDetailModal from './CVDetailModal';


const API_URL = 'http://localhost:5000/api/cv';
const emptyCV = {
  name: '',
  email: '',
  phone: '',
  address: '',
  gender: '',
  dob: '',
  avatar: '',
  skills: [],
  summary: '',
  website: '',
  education: [{ school: '', degree: '', field: '', startYear: '', endYear: '' }],
  experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
  projects: [{ name: '', description: '', link: '' }],
  certifications: [{ name: '', organization: '', year: '' }],
  languages: [{ name: '', level: '' }],
  interests: [''],
  references: [{ name: '', contact: '', relation: '' }],
  awards: [{ name: '', year: '', description: '' }],
};

export default function CVManager({ user, onBack, search }: { user: any, onBack: () => void, search?: string }) {
  const [cvs, setCVs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(emptyCV);
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchCVs = async () => {
  setLoading(true);
  setError('');
    try {
      const res = await fetch(`${API_URL}/my?page=${page}&pageSize=${pageSize}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải CV');
      // Chuẩn hóa lấy data và total từ API mới
      setCVs(Array.isArray(data.data) ? data.data : []);
      setTotal(typeof data.total === 'number' ? data.total : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCVs(); }, [page, pageSize]);

      const handleCreate = () => {
        setForm(emptyCV);
        setEditId(null);
        setShowForm(true);
        setMessage('');
      };

      const handleEdit = (cv: any) => {
        setForm({
          ...emptyCV,
          ...cv
        });
        setEditId(cv._id);
        setShowForm(true);
        setMessage('');
      };

      const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa CV này?')) return;
        try {
          const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Lỗi xóa CV');
          setMessage('Đã xóa CV!');
          fetchCVs();
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
          const submitForm = { ...form };
          const res = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(submitForm),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Lỗi lưu CV');
          setShowForm(false);
          setMessage(editId ? 'Đã cập nhật CV!' : 'Đã tạo CV mới!');
          fetchCVs();
        } catch (err) {
          setMessage(err instanceof Error ? err.message : 'Lỗi không xác định');
        }
      };


      // Xử lý thay đổi input text và upload file avatar
      const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.target.type === 'file') {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
              const res = await fetch('http://localhost:5000/api/upload/logo', {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: formData,
              });
              const data = await res.json();
              if (res.ok && data.url) {
                setForm((f: any) => ({ ...f, avatar: data.url }));
              } else {
                alert(data.message || 'Lỗi upload ảnh');
              }
            } catch {
              alert('Lỗi upload ảnh');
            }
          }
        } else {
          setForm({ ...form, [e.target.name]: e.target.value });
        }
      };

  const filteredCVs = search
    ? cvs.filter(cv =>
        cv.name?.toLowerCase().includes(search.toLowerCase()) ||
        cv.email?.toLowerCase().includes(search.toLowerCase()) ||
        cv.phone?.toLowerCase().includes(search.toLowerCase())
      )
    : cvs;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

      const [selectedCV, setSelectedCV] = useState<any>(null);

      return (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-2xl shadow-2xl border border-blue-200 animate-fade-in-down">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow">Quản lý CV</h2>
            <button className="bg-gray-700 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-gray-900 transition" onClick={onBack}>Quay lại</button>
          </div>
          {message && <div className="mb-2 text-green-600 font-semibold animate-pulse">{message}</div>}
          {error && <div className="mb-2 text-red-600 font-semibold animate-pulse">{error}</div>}
          {!showForm && (
            <>
              <button className="mb-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200" onClick={handleCreate}>Tạo CV mới</button>
              <ul>
                {filteredCVs.map(cv => (
                  <li key={cv._id} className="border-b py-3 flex flex-col sm:flex-row justify-between items-center gap-2 hover:bg-blue-50 rounded-lg transition">
                    <div>
                      <span className="font-semibold text-blue-700 text-lg">{cv.name}</span> <span className="text-sm text-gray-600">{cv.email}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 font-semibold px-3 py-1 rounded hover:bg-blue-100 transition" onClick={() => setSelectedCV(cv)}>Xem</button>
                      <button className="text-blue-600 font-semibold px-3 py-1 rounded hover:bg-blue-100 transition" onClick={() => handleEdit(cv)}>Sửa</button>
                      <button className="text-red-600 font-semibold px-3 py-1 rounded hover:bg-red-100 transition" onClick={() => handleDelete(cv._id)}>Xóa</button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 font-semibold"
                  >Trước</button>
                  <span className="text-sm font-semibold text-gray-700">
                    Trang <span className="text-blue-600">{page}</span> / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 font-semibold"
                  >Sau</button>
                </div>
              )}
              {filteredCVs.length === 0 && !loading && <div className="text-gray-500 italic">Bạn chưa có CV nào.</div>}
            </>
          )}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
              <input className="w-full border-2 border-blue-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" name="name" placeholder="Họ tên" value={form.name} onChange={handleChange} required />
              <input className="w-full border-2 border-blue-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <input className="w-full border-2 border-blue-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
              <input className="w-full border-2 border-blue-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} />
              <input className="w-full border-2 border-blue-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" name="gender" placeholder="Giới tính" value={form.gender} onChange={handleChange} />
              <input className="w-full border-2 border-blue-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" name="dob" placeholder="Ngày sinh" value={form.dob} onChange={handleChange} />
              <div>
                <label className="block mb-1 font-semibold text-blue-700">Ảnh đại diện</label>
                <input type="file" accept="image/*" className="w-full border-2 border-blue-200 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" name="avatarFile" onChange={handleChange} />
                {form.avatar && (
                  <img src={form.avatar.startsWith('/uploads/') ? `http://localhost:5000${form.avatar}` : form.avatar} alt="avatar" className="w-20 h-20 object-cover rounded-full border-2 border-blue-300 shadow mt-2" />
                )}
              </div>
              <input className="w-full border-2 border-blue-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" name="skills" placeholder="Kỹ năng (cách nhau bởi dấu phẩy)" value={form.skills?.join(', ')} onChange={e => setForm({ ...form, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} />
              <div className="flex gap-2">
                <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200" type="submit">Lưu</button>
                <button className="bg-gray-400 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-gray-600 transition-all duration-200" type="button" onClick={() => setShowForm(false)}>Hủy</button>
              </div>
            </form>
          )}
          {selectedCV && (
            <CVDetailModal
              userId={selectedCV.user}
              onClose={() => setSelectedCV(null)}
            />
          )}
          {loading && <div className="text-blue-600 font-semibold animate-pulse">Đang tải...</div>}
          <style>{`
            @keyframes fade-in-down {
              0% { opacity: 0; transform: translateY(-20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.5s; }
          `}</style>
        </div>
      );
    }
