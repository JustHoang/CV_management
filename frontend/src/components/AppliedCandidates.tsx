import React, { useEffect, useState } from 'react';
import CVDetailModal from './CVDetailModal';


export default function AppliedCandidates() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/job/applied/candidates', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message || 'Lỗi tải danh sách ứng viên');
        setData(d);
      } catch (err: any) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="mt-10 max-w-3xl mx-auto p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl border border-blue-100 animate-fade-in-down">
      <h2 className="text-2xl font-extrabold mb-6 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow">Ứng viên đã ứng tuyển</h2>
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 font-semibold animate-pulse">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          Đang tải...
        </div>
      )}
      {error && <div className="text-red-500 font-semibold animate-pulse">{error}</div>}
      {data.length === 0 && !loading && (
        <div className="flex flex-col items-center gap-2 text-gray-500 italic mt-8">
          <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
          Chưa có ứng viên nào ứng tuyển.
        </div>
      )}
      {data.map((group: any) => (
        <div key={group.job._id} className="mb-8">
          <div className="flex items-center gap-2 font-bold text-lg text-blue-700 mb-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
            {group.job.title}
          </div>
          <ul>
            {group.candidates.map((c: any) => (
              <li
                key={c._id}
                className="border-b py-3 flex items-center gap-4 hover:bg-blue-50 rounded-lg transition cursor-pointer group"
                onClick={() => setSelectedUserId(c._id)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedUserId(c._id); }}
                aria-label={`Xem CV của ${c.username}`}
              >
                {c.avatar ? (
                  <img
                    src={c.avatar.startsWith('/uploads/') ? `http://localhost:5000${c.avatar}` : c.avatar}
                    alt="avatar"
                    className="w-10 h-10 object-cover rounded-full border-2 border-blue-300 shadow"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 border-2 border-blue-200 text-blue-400 font-bold text-lg shadow">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-blue-700 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                      <svg className="w-3 h-3 mr-1 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 1" /></svg>
                      Ứng viên
                    </span>
                    {c.username}
                  </div>
                  <div className="text-sm text-gray-600">{c.email}</div>
                  <div className="text-xs text-gray-400">Nộp lúc: {new Date(c.appliedAt).toLocaleString()}</div>
                </div>
                <a
                  href={`mailto:${c.email}`}
                  className="ml-2 px-3 py-1 bg-green-500 text-white rounded-lg shadow hover:bg-green-700 transition text-sm opacity-80 hover:opacity-100 group-hover:scale-105"
                  title={`Liên hệ ${c.username}`}
                  onClick={e => e.stopPropagation()}
                >
                  Liên hệ
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {selectedUserId && <CVDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
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
