import React, { useEffect, useState } from 'react';
import CVDetailModal from './CVDetailModal';

function CVMatchModal({ jobId, onClose }: { jobId: string, onClose: () => void }) {
  const [cvs, setCVs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCVUserId, setSelectedCVUserId] = useState<string | null>(null);

  const fetchCVs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/cv/match/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải CV');
      setCVs(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
      setCVs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCVs(); }, [jobId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in-down">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl border border-blue-200 p-6 w-full max-w-2xl relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-3xl font-bold" onClick={onClose}>×</button>
        <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          10 CV phù hợp nhất
        </h2>
        {loading && <div className="text-blue-600 font-semibold animate-pulse flex items-center gap-2"><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Đang tải...</div>}
        {error && <div className="text-red-500 font-semibold animate-pulse">{error}</div>}
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
          {cvs.map(cv => (
            <div
              key={cv._id}
              className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border border-blue-100 hover:shadow-lg hover:border-blue-300 transition cursor-pointer group"
              onClick={() => setSelectedCVUserId(cv.user?._id || cv.user)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                  <svg className="w-4 h-4 mr-1 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 1" /></svg>
                  CV
                </span>
                <span className="font-bold text-blue-700 text-base group-hover:underline">{cv.name}</span>
                {typeof cv.matchingScore === 'number' && (
                  <span className="ml-auto text-xs text-green-700 font-semibold bg-green-100 rounded px-2 py-0.5 border border-green-200 shadow">
                    <svg className="w-4 h-4 inline-block mr-1 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Điểm phù hợp: <span className="font-bold">{cv.matchingScore}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                {cv.skills?.map((tag: string) => (
                  <span key={tag} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">{tag}</span>
                ))}
              </div>
              <div className="text-sm text-gray-600 font-medium">{cv.email}</div>
              <div className="text-xs text-gray-700 line-clamp-2 italic">{cv.summary}</div>
            </div>
          ))}
        </div>
        {cvs.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center gap-2 text-gray-500 italic mt-8">
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
            Không có CV phù hợp.
          </div>
        )}
        {selectedCVUserId && (
          <CVDetailModal userId={selectedCVUserId} onClose={() => setSelectedCVUserId(null)} hideJobMatchButton={false} />
        )}
      </div>
    </div>
  );
}

export default function JobDetailModal({ jobId, onClose }: { jobId: string, onClose: () => void }) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCVsModal, setShowCVsModal] = useState(false);
  const [matchedCVs, setMatchedCVs] = useState<any[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [cvError, setCVError] = useState('');
  const [selectedCVUserId, setSelectedCVUserId] = useState<string|null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/api/job/${jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Lỗi tải thông tin bài tuyển dụng');
        setJob(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const fetchMatchedCVs = async () => {
    if (!job) return;
    setLoadingCVs(true);
    setCVError('');
    try {
      const url = `http://localhost:5000/api/cv/match/${job._id}`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải CV');
      setMatchedCVs(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setCVError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setMatchedCVs([]);
    } finally {
      setLoadingCVs(false);
    }
  };

  // Lấy role user hiện tại
  let role = '';
  try {
    const user = localStorage.getItem('user');
    if (user) role = JSON.parse(user).role;
  } catch {}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in-down">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl border border-blue-200 p-4 w-full max-w-lg relative max-h-[80vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-3xl font-bold" onClick={onClose}>×</button>
        {loading && (
          <div className="flex items-center gap-2 text-blue-600 font-semibold animate-pulse">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            Đang tải bài tuyển dụng...
          </div>
        )}
        {error && <div className="text-red-500 font-semibold animate-pulse">{error}</div>}
        {job && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 text-base font-bold rounded bg-blue-100 text-blue-700 border border-blue-300 shadow gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
                Bài tuyển dụng
              </span>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow">{job.title}</h2>
            </div>
            <div className="mb-2 text-gray-700">Mô tả: {job.description}</div>
            <div className="mb-2 text-gray-700">Yêu cầu: {job.requirements}</div>
            <div className="mb-2 text-gray-700">Địa điểm: {job.location}</div>
            <div className="mb-2 text-gray-700">Hạn nộp: {job.deadline}</div>
            <div className="mb-2 text-gray-700">Liên hệ: {job.contact}</div>
            <div className="mb-2 text-gray-700">Phúc lợi: {job.benefits}</div>
            <div className="mb-2 text-gray-700">Tags: {job.tags?.join(', ')}</div>
            {role === 'candidate' ? (
              <button
                className="mt-4 bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
                onClick={() => {
                  alert('Ứng tuyển thành công!');
                }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Ứng tuyển
              </button>
            ) : (
              <button
                className="mt-4 bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
                onClick={() => setShowCVsModal(true)}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Xem CV phù hợp
              </button>
            )}
            {showCVsModal && (
              <CVMatchModal jobId={job._id} onClose={() => setShowCVsModal(false)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
