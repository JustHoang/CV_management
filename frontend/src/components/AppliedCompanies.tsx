import React, { useEffect, useState } from 'react';
import JobDetailModal from './JobDetailModal';


export default function AppliedCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/job/applied/companies', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Lỗi tải danh sách công ty');
        setCompanies(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="mt-10 max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl border border-blue-100 animate-fade-in-down">
      <h2 className="text-2xl font-extrabold mb-6 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow">Công ty đã ứng tuyển</h2>
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 font-semibold animate-pulse">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          Đang tải...
        </div>
      )}
      {error && <div className="text-red-500 font-semibold animate-pulse">{error}</div>}
      <ul>
        {companies.filter(c => c.jobId && c.company && c.company.companyName && c.jobTitle).map(c => (
          <li
            key={c.jobId}
            className="border-b py-4 flex items-center gap-4 hover:bg-blue-50 rounded-lg transition group"
          >
            {c.company && c.company.companyLogo ? (
              <img
                src={c.company.companyLogo.startsWith('/uploads/') ? `http://localhost:5000${c.company.companyLogo}` : c.company.companyLogo}
                alt="logo"
                className="w-12 h-12 object-contain rounded-full border-2 border-blue-300 shadow"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <span className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 border-2 border-blue-200 text-blue-400 font-bold text-lg shadow">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-10 0v6a2 2 0 002 2h4a2 2 0 002-2v-6m-6 0h6" /></svg>
              </span>
            )}
            <div
              className="flex-1 cursor-pointer"
              onClick={() => c.jobId && setSelectedJobId(c.jobId)}
              tabIndex={0}
              onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && c.jobId) setSelectedJobId(c.jobId); }}
              aria-label={`Xem thông tin bài tuyển dụng của ${c.company?.companyName || ''}`}
            >
              <div className="font-semibold text-blue-700 text-lg flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded bg-green-100 text-green-700 border border-green-300">
                  <svg className="w-3 h-3 mr-1 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
                  Công ty
                </span>
                {c.company?.companyName || ''}
              </div>
              <div className="text-sm text-gray-800 font-semibold">Chức danh: {c.jobTitle || ''}</div>
              <div className="text-sm text-gray-600">{c.company?.email || ''}</div>
            </div>
            {c.jobId && (
              <button
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-700 transition text-sm opacity-80 group-hover:opacity-100"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await fetch(`http://localhost:5000/api/job/${c.jobId}/apply`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      alert(data.message || 'Lỗi hủy ứng tuyển');
                    } else {
                      setCompanies(prev => prev.filter(x => x.jobId !== c.jobId));
                    }
                  } catch (err) {
                    alert('Lỗi kết nối');
                  }
                }}
                title="Hủy ứng tuyển"
              >
                Hủy ứng tuyển
              </button>
            )}
          </li>
        ))}
      </ul>
      {selectedJobId && <JobDetailModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />}
      {companies.length === 0 && !loading && (
        <div className="flex flex-col items-center gap-2 text-gray-500 italic mt-8">
          <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
          Bạn chưa ứng tuyển công ty nào.
        </div>
      )}
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
