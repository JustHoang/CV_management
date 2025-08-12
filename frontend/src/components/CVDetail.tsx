import React from 'react';

import { useEffect, useState } from 'react';
import JobDetail from './JobDetail';
import { useRef } from 'react';

export default function CVDetail({ cv, onClose }: { cv: any, onClose: () => void }) {
  const [role, setRole] = useState<string>('');
  const [showJobs, setShowJobs] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // Lấy role từ localStorage (giả định đã lưu khi đăng nhập)
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setRole(parsed.role || '');
      } catch {}
    }
  }, []);

  // Hàm lấy 10 job phù hợp với CV
  const fetchMatchedJobs = async () => {
    if (!cv) return;
    setLoadingJobs(true);
    setJobsError('');
    try {
      const params = new URLSearchParams();
      if (cv.skills && cv.skills.length > 0) params.append('skills', cv.skills.join(','));
      if (cv.experience && cv.experience.length > 0 && cv.experience[0].position) params.append('title', cv.experience[0].position);
      params.append('limit', '10');
      const url = `http://localhost:5000/api/job?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải bài tuyển dụng');
      setMatchedJobs(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setJobsError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setMatchedJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };
  if (!cv) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-down">
  <div className="bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-3xl shadow-2xl border-2 border-blue-300 p-8 w-full max-w-2xl relative max-h-[92vh] overflow-y-auto">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-4xl font-extrabold rounded-full bg-white bg-opacity-80 w-12 h-12 flex items-center justify-center shadow-lg transition" onClick={onClose} aria-label="Đóng">×</button>
        <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow-lg text-center">{cv.name}</h2>
        {cv.avatar && <img src={cv.avatar} alt="avatar" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-400 shadow-xl bg-white" />}
        <div className="mb-2 flex flex-wrap gap-3 justify-center">
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Email: {cv.email}</span>
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">SĐT: {cv.phone}</span>
          <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">Địa chỉ: {cv.address}</span>
          {cv.gender && <span className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-semibold">Giới tính: {cv.gender}</span>}
          {cv.dob && <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">Ngày sinh: {cv.dob}</span>}
          {cv.website && <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold"><a href={cv.website} className="underline" target="_blank" rel="noopener noreferrer">Website</a></span>}
        </div>
        <div className="mb-4 text-gray-700 text-base text-center font-medium">{cv.summary}</div>
        <div className="mb-4">
          <div className="font-bold text-blue-700 mb-1">Học vấn</div>
          <ul className="list-disc ml-6 text-base">
            {cv.education?.map((edu: any, i: number) => (
              <li key={i}>{edu.degree} - {edu.school} ({edu.startYear} - {edu.endYear}) {edu.field && `- ${edu.field}`}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <div className="font-bold text-blue-700 mb-1">Kinh nghiệm</div>
          <ul className="list-disc ml-6 text-base">
            {cv.experience?.map((exp: any, i: number) => (
              <li key={i}>{exp.position} tại {exp.company} ({exp.startDate} - {exp.endDate}): {exp.description}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <div className="font-bold text-blue-700 mb-1">Kỹ năng</div>
          <div className="flex flex-wrap gap-2">
            {cv.skills?.map((s: string, i: number) => (
              <span key={i} className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold text-sm">{s}</span>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="font-bold text-blue-700 mb-1">Dự án</div>
          <ul className="list-disc ml-6 text-base">
            {cv.projects?.map((prj: any, i: number) => (
              <li key={i}>{prj.name}: {prj.description} {prj.link && (<a href={prj.link} className="text-blue-600 underline ml-2" target="_blank" rel="noopener noreferrer">Link</a>)}</li>
            ))}
          </ul>
        </div>
        {cv.certifications?.length > 0 && (
          <div className="mb-4">
            <div className="font-bold text-blue-700 mb-1">Chứng chỉ</div>
            <ul className="list-disc ml-6 text-base">
              {cv.certifications.map((c: any, i: number) => (
                <li key={i}>{c.name} - {c.organization} ({c.year})</li>
              ))}
            </ul>
          </div>
        )}
        {cv.languages?.length > 0 && (
          <div className="mb-4">
            <div className="font-bold text-blue-700 mb-1">Ngôn ngữ</div>
            <div className="flex flex-wrap gap-2">
              {cv.languages.map((l: any, i: number) => (
                <span key={i} className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-semibold text-sm">{l.name} ({l.level})</span>
              ))}
            </div>
          </div>
        )}
        {cv.interests?.length > 0 && (
          <div className="mb-4">
            <div className="font-bold text-blue-700 mb-1">Sở thích</div>
            <div className="flex flex-wrap gap-2">
              {cv.interests.map((s: string, i: number) => (
                <span key={i} className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-sm">{s}</span>
              ))}
            </div>
          </div>
        )}
        {cv.references?.length > 0 && (
          <div className="mb-4">
            <div className="font-bold text-blue-700 mb-1">Người tham chiếu</div>
            <ul className="list-disc ml-6 text-base">
              {cv.references.map((r: any, i: number) => (
                <li key={i}>{r.name} - {r.contact} ({r.relation})</li>
              ))}
            </ul>
          </div>
        )}
        {cv.awards?.length > 0 && (
          <div className="mb-4">
            <div className="font-bold text-blue-700 mb-1">Giải thưởng</div>
            <ul className="list-disc ml-6 text-base">
              {cv.awards.map((a: any, i: number) => (
                <li key={i}>{a.name} ({a.year}): {a.description}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          {role !== 'employer' && (
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-800 hover:to-blue-600 text-white font-extrabold py-3 px-6 rounded-2xl shadow-lg transition text-lg focus:ring-2 focus:ring-blue-400 flex items-center gap-2 justify-center"
              onClick={() => {
                setShowJobs(true);
                fetchMatchedJobs();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a5.25 5.25 0 11-7.424 7.426M12 21v-9m0 0l-3.5 3.5M12 12l3.5 3.5" />
              </svg>
              Xem bài tuyển dụng phù hợp
            </button>
          )}
          {role === 'employer' && (
            <button
              className="w-full bg-gradient-to-r from-green-600 to-green-400 hover:from-green-800 hover:to-green-600 text-white font-extrabold py-3 px-6 rounded-2xl shadow-lg transition text-lg focus:ring-2 focus:ring-green-400 flex items-center gap-2 justify-center"
              onClick={() => {
                if (cv.email) window.open(`mailto:${cv.email}`);
                else alert('Không có email liên hệ!');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
              Liên hệ ứng viên
            </button>
          )}
        </div>

        {/* Danh sách 10 job phù hợp */}
        {showJobs && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-blue-700">10 bài tuyển dụng phù hợp</h3>
              <button className="text-red-500 font-extrabold text-3xl rounded-full bg-white bg-opacity-80 w-10 h-10 flex items-center justify-center shadow transition" onClick={() => setShowJobs(false)} aria-label="Đóng">×</button>
            </div>
            {loadingJobs && <div className="text-blue-600 font-semibold animate-pulse">Đang tải...</div>}
            {jobsError && <div className="text-red-500 font-semibold animate-pulse">{jobsError}</div>}
            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2">
              {matchedJobs.map(job => (
                <div key={job._id} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 flex flex-col gap-1 hover:shadow-blue-200 hover:border-blue-400 transition cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="font-bold text-blue-700 text-lg">{job.title}</div>
                  <div className="text-sm text-blue-500 font-semibold">{job.companyName || job.company?.companyName || ''}</div>
                  <div className="text-xs text-gray-500">{job.location}</div>
                  <div className="text-xs text-gray-700 line-clamp-2">{job.description}</div>
                </div>
              ))}
              {matchedJobs.length === 0 && !loadingJobs && !jobsError && (
                <div className="text-gray-500 italic">Không có bài tuyển dụng phù hợp.</div>
              )}
            </div>
            {selectedJob && (
              <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} onApplied={() => {
                setSelectedJob(null);
                setShowToast(true);
                if (toastTimeout.current) clearTimeout(toastTimeout.current);
                toastTimeout.current = setTimeout(() => setShowToast(false), 2500);
              }} />
            )}
            {showToast && (
              <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-[9999] font-bold text-lg animate-fade-in-down">
                Ứng tuyển thành công!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
