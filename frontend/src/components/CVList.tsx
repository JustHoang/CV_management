import React, { useEffect, useState } from 'react';
import CVDetail from './CVDetail';

const API_URL = 'http://localhost:5000/api/cv/all';

export default function CVList({ search }: { search?: any }) {
  const [cvs, setCVs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCV, setSelectedCV] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCVs = async () => {
      setLoading(true);
      setError('');
      try {
        let url = `${API_URL}?page=${page}&pageSize=${pageSize}`;
        if (search && typeof search === 'object') {
          Object.entries(search).forEach(([key, value]) => {
            if (value) url += `&${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`;
          });
        }
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Lỗi tải CV');
          setCVs([]);
          setTotal(0);
          return;
        }
        setCVs(Array.isArray(data.data) ? data.data : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        setCVs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCVs();
  }, [page, pageSize, search]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      {loading && <div className="text-blue-600 font-semibold animate-pulse">Đang tải...</div>}
      {error && <div className="text-red-500 font-semibold animate-pulse">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {(Array.isArray(cvs) ? cvs : []).map(cv => (
          <div
            key={cv._id}
            className="bg-white border-2 border-blue-200 rounded-3xl shadow-2xl hover:shadow-blue-300 hover:border-blue-400 hover:scale-[1.025] p-8 flex flex-col items-center cursor-pointer transition-all duration-200 group animate-fade-in-down"
            onClick={() => setSelectedCV(cv)}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedCV(cv); }}
            aria-label={`Xem chi tiết CV của ${cv.name}`}
          >
            {cv.avatar && (
              <img
                src={cv.avatar.startsWith('/uploads/') ? `http://localhost:5000${cv.avatar}` : cv.avatar}
                alt="avatar"
                className="w-28 h-28 object-cover rounded-full border-4 border-blue-400 shadow-xl mb-4 bg-white"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
            <div className="font-extrabold text-2xl text-blue-700 group-hover:underline group-hover:text-blue-900 transition mb-2 text-center">{cv.name}</div>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm">{cv.email}</span>
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">{cv.phone}</span>
            </div>
            <div className="text-base text-gray-500 italic mb-2 text-center">{cv.summary}</div>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {cv.skills?.map((s: string, i: number) => (
                <span key={i} className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold text-xs">{s}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-xs">Địa chỉ: {cv.address}</span>
              {cv.gender && <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-semibold text-xs">Giới tính: {cv.gender}</span>}
              {cv.dob && <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-xs">Ngày sinh: {cv.dob}</span>}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold text-xs">Tạo lúc: {cv.createdAt ? new Date(cv.createdAt).toLocaleString() : ''}</span>
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold text-xs">Cập nhật: {cv.updatedAt ? new Date(cv.updatedAt).toLocaleString() : ''}</span>
            </div>
          </div>
        ))}
      </div>
      {cvs.length === 0 && !loading && <div className="text-gray-500 italic">Không có CV nào phù hợp.</div>}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >Trước</button>
          <span className="text-sm font-semibold text-gray-700">
            Trang <span className="text-blue-600">{page}</span> / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >Sau</button>
        </div>
      )}
      {selectedCV && <CVDetail cv={selectedCV} onClose={() => setSelectedCV(null)} />}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s; }
      `}</style>
    </>
  );
}
