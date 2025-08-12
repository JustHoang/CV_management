import React, { useEffect, useState } from 'react';

import JobDetailModal from './JobDetailModal';

function JobMatchModal({ cvId, onClose }: { cvId: string, onClose: () => void }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/cv/job-match/${cvId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải job');
      setJobs(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      setError(err.message || 'Lỗi không xác định');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [cvId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in-down">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl border border-blue-200 p-6 w-full max-w-2xl relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-3xl font-bold" onClick={onClose}>×</button>
        <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
          10 bài tuyển dụng phù hợp nhất
        </h2>
        {loading && <div className="text-blue-600 font-semibold animate-pulse flex items-center gap-2"><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Đang tải...</div>}
        {error && <div className="text-red-500 font-semibold animate-pulse">{error}</div>}
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
          {jobs.map(job => (
            <div
              key={job._id}
              className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border border-blue-100 hover:shadow-lg hover:border-blue-300 transition cursor-pointer group"
              onClick={() => setSelectedJobId(job._id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                  <svg className="w-4 h-4 mr-1 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
                  JOB
                </span>
                <span className="font-bold text-blue-700 text-base group-hover:underline">{job.title}</span>
                {typeof job.matchingScore === 'number' && (
                  <span className="ml-auto text-xs text-green-700 font-semibold bg-green-100 rounded px-2 py-0.5 border border-green-200 shadow">
                    <svg className="w-4 h-4 inline-block mr-1 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Điểm phù hợp: <span className="font-bold">{job.matchingScore}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                {job.tags?.map((tag: string) => (
                  <span key={tag} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">{tag}</span>
                ))}
              </div>
              <div className="text-sm text-gray-600 font-medium">{job.company}</div>
              <div className="text-xs text-gray-700 line-clamp-2 italic">{job.description}</div>
            </div>
          ))}
        </div>
        {jobs.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center gap-2 text-gray-500 italic mt-8">
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
            Không có bài tuyển dụng phù hợp.
          </div>
        )}
        {selectedJobId && (
          <JobDetailModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
        )}
      </div>
    </div>
  );
}

interface CVDetailModalProps {
  userId: string;
  onClose: () => void;
  hideJobMatchButton?: boolean;
}

export default function CVDetailModal({ userId, onClose, hideJobMatchButton }: CVDetailModalProps) {
  const [cv, setCV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJobMatch, setShowJobMatch] = useState(false);

  useEffect(() => {
    const fetchCV = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/api/cv/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Lỗi tải CV');
        setCV(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchCV();
  }, [userId]);

  if (!userId) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in-down">
  <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl border border-blue-200 p-4 w-full max-w-lg relative max-h-[80vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-3xl font-bold" onClick={onClose}>×</button>
        {loading && (
          <div className="flex items-center gap-2 text-blue-600 font-semibold animate-pulse">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            Đang tải CV...
          </div>
        )}
        {error && <div className="text-red-500 font-semibold animate-pulse">{error}</div>}
        {cv && (
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center px-3 py-1 text-base font-bold rounded bg-blue-100 text-blue-700 border border-blue-300 shadow gap-2 mb-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              CV Ứng viên
            </span>
            {cv.avatar ? (
              <img
                src={cv.avatar.startsWith('/uploads/') ? `http://localhost:5000${cv.avatar}` : cv.avatar}
                alt="avatar"
                className="w-24 h-24 object-cover rounded-full border-2 border-blue-300 shadow mb-4"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <span className="w-24 h-24 flex items-center justify-center rounded-full bg-blue-100 border-2 border-blue-200 text-blue-400 font-bold text-3xl shadow mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
            )}
            <h2 className="text-2xl font-extrabold mb-4 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow">{cv.name}</h2>
            <div className="mb-2 text-gray-700">Email: {cv.email}</div>
            <div className="mb-2 text-gray-700">SĐT: {cv.phone}</div>
            <div className="mb-2 text-gray-700">Địa chỉ: {cv.address}</div>
            <div className="mb-2 text-gray-700">Giới tính: {cv.gender}</div>
            <div className="mb-2 text-gray-700">Ngày sinh: {cv.dob}</div>
            <div className="mb-2 text-gray-700">Kỹ năng: {cv.skills?.join(', ')}</div>
            <div className="mb-2 text-gray-700">Tóm tắt: {cv.summary}</div>
            <div className="flex flex-col gap-2 w-full">
              {/* Hiển thị nút liên hệ ứng viên nếu user hiện tại KHÁC user của CV */}
              {(() => {
                const user = localStorage.getItem('user');
                let currentUserId = '';
                try {
                  if (user) {
                    const parsed = JSON.parse(user);
                    currentUserId = parsed._id || parsed.userId || '';
                  }
                } catch {}
                // Nếu không xác định được userId hoặc userId trùng với CV thì KHÔNG hiển thị nút liên hệ
                if (!currentUserId || !cv.user || cv.user.toString() === currentUserId) {
                  return null;
                }
                return (
                  <button
                    className="mt-4 bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                    onClick={() => {
                      if (cv.email) window.open(`mailto:${cv.email}`);
                      else alert('Không có email liên hệ!');
                    }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h7" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5l-9 6.5-9-6.5" /></svg>
                    Liên hệ ứng viên
                  </button>
                );
              })()}
              {!hideJobMatchButton && (
                <>
                  <button
                    className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                    onClick={() => setShowJobMatch(true)}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
                    Xem bài tuyển dụng phù hợp
                  </button>
                  {showJobMatch && <JobMatchModal cvId={cv._id} onClose={() => setShowJobMatch(false)} />}
                </>
              )}
            </div>
          </div>
        )}
  {/* Hiển thị modal job match nếu có */}
  {!cv && !loading && !error && (
          <div className="flex flex-col items-center gap-2 text-gray-500 italic mt-8">
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
            Không tìm thấy CV.
          </div>
        )}
      </div>
    </div>
  );
}
