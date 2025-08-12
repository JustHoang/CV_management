
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import JobDetail from './JobDetail';

const API_URL = 'http://localhost:5000/api/job';

export default function JobList() {
  const location = useLocation();
  // ...existing code...
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  // Lấy query từ URL nếu có
  function getQueryFilters() {
    const params = new URLSearchParams(location.search);
    return {
      title: params.get('title') || '',
      experienceLevel: params.get('experienceLevel') || '',
      jobType: params.get('jobType') || '',
      skills: params.get('skills') || '',
    };
  }
  const [filter, setFilter] = useState(() => {
    const q = getQueryFilters();
    // Nếu có skills, ưu tiên tìm theo title đầu tiên là skill
    if (q.skills && !q.title) {
      const firstSkill = q.skills.split(',')[0];
      return { ...q, title: firstSkill };
    }
    return q;
  });

const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
const [showApplySuccess, setShowApplySuccess] = useState(false);

// Hàm lấy danh sách job đã ứng tuyển (theo API mới: trả về từng job đã apply)
const fetchAppliedJobs = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch('http://localhost:5000/api/job/applied/companies', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      setAppliedJobs(data.map(j => j.jobId));
    }
  } catch {}
};
useEffect(() => { fetchAppliedJobs(); }, []);

// Hàm ứng tuyển
const handleApply = async (jobId: string) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch(`http://localhost:5000/api/job/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      await fetchAppliedJobs();
      setShowApplySuccess(true);
      setTimeout(() => setShowApplySuccess(false), 2000);
    } else {
      alert(data.message || 'Lỗi ứng tuyển');
    }
  } catch {
    alert('Lỗi kết nối');
  }
};

// Hàm hủy ứng tuyển
const handleUnapply = async (jobId: string) => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch(`http://localhost:5000/api/job/${jobId}/apply`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      await fetchAppliedJobs();
    } else {
      alert(data.message || 'Lỗi hủy ứng tuyển');
    }
  } catch {
    alert('Lỗi kết nối');
  }
};



  // jobs: all jobs for dropdowns, filteredJobs: jobs to display
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);

  // Fetch all jobs for dropdowns on mount, và tự động tìm kiếm nếu có query
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const url = `${API_URL}?page=${page}&pageSize=${pageSize}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Lỗi tải bài tuyển dụng');
        setJobs(data.data);
        setFilteredJobs(data.data); // Show all jobs by default
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  // Tự động tìm kiếm nếu có query trên URL
  useEffect(() => {
    const params = getQueryFilters();
    // Nếu có ít nhất 1 filter, tự động tìm kiếm
    if (params.title  || params.experienceLevel || params.jobType || params.skills) {
      (async () => {
        setLoading(true);
        setError('');
        try {
          const searchParams = new URLSearchParams();
          if (params.title) searchParams.append('title', params.title);

          if (params.experienceLevel) searchParams.append('experienceLevel', params.experienceLevel);
          if (params.jobType) searchParams.append('jobType', params.jobType);
          if (params.skills) searchParams.append('skills', params.skills);
          const url = searchParams.toString() ? `${API_URL}?${searchParams.toString()}` : API_URL;
          const res = await fetch(url);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Lỗi tải bài tuyển dụng');
          setFilteredJobs(Array.isArray(data.data) ? data.data : []);
          setTotal(typeof data.total === 'number' ? data.total : 0);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Lỗi không xác định');
          setFilteredJobs([]);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line
  }, [location.search]);

  // Lấy danh sách các giá trị duy nhất cho dropdown từ tất cả jobs
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const uniqueTitles = Array.from(new Set(safeJobs.map(j => j.title).filter(Boolean)));
  
  // Sử dụng giá trị cố định cho dropdown kinh nghiệm và hình thức để đồng bộ với backend
  const experienceOptions = [
    { value: '', label: 'Kinh nghiệm...' },
    { value: '0', label: '0-1 năm' },
    { value: '1', label: '1 năm' },
    { value: '2', label: '2 năm' },
    { value: '3', label: 'Trên 3 năm' },
  ];
  const jobTypeOptions = [
    { value: '', label: 'Hình thức...' },
    { value: 'fulltime', label: 'FullTime' },
    { value: 'parttime', label: 'PartTime' },
    { value: 'remote', label: 'Remote' },
    { value: 'intern', label: 'Intern' },
  ];

  // Xử lý submit form tìm kiếm
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Build query string from filter
      const params = new URLSearchParams();
      if (filter.title) params.append('title', filter.title);
      
      if (filter.experienceLevel) params.append('experienceLevel', filter.experienceLevel);
      if (filter.jobType) params.append('jobType', filter.jobType);
      const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi tải bài tuyển dụng');
  setFilteredJobs(Array.isArray(data.data) ? data.data : []);
  setTotal(typeof data.total === 'number' ? data.total : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-end p-4 rounded-2xl shadow-lg border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-100 animate-fade-in-down"
        onSubmit={handleSearch}
        style={{ maxWidth: 800, marginLeft: 'auto' }}
      >
        <div className="relative w-full max-w-[180px]">
          <select
            className="pl-4 pr-8 py-3 border-2 border-blue-300 rounded-2xl w-full text-base focus:ring-4 focus:ring-blue-300 transition bg-white shadow-sm appearance-none hover:border-blue-400 hover:shadow-md cursor-pointer outline-none"
            value={filter.title}
            onChange={e => setFilter(f => ({ ...f, title: e.target.value }))}
          >
            <option value="">Chức danh...</option>
            {uniqueTitles.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
          <svg className="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
        <div className="relative w-full max-w-[150px]">
          <select
            className="pl-4 pr-8 py-3 border-2 border-blue-300 rounded-2xl w-full text-base focus:ring-4 focus:ring-blue-300 transition bg-white shadow-sm appearance-none hover:border-blue-400 hover:shadow-md cursor-pointer outline-none"
            value={filter.experienceLevel}
            onChange={e => setFilter(f => ({ ...f, experienceLevel: e.target.value }))}
          >
            {experienceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <svg className="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
        <div className="relative w-full max-w-[150px]">
          <select
            className="pl-4 pr-8 py-3 border-2 border-blue-300 rounded-2xl w-full text-base focus:ring-4 focus:ring-blue-300 transition bg-white shadow-sm appearance-none hover:border-blue-400 hover:shadow-md cursor-pointer outline-none"
            value={filter.jobType}
            onChange={e => setFilter(f => ({ ...f, jobType: e.target.value }))}
          >
            {jobTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <svg className="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-bold shadow-lg hover:from-blue-800 hover:to-blue-600 transition text-base focus:ring-2 focus:ring-blue-400"
          tabIndex={0}
          style={{ minWidth: 110 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
          Tìm kiếm
        </button>
      </form>
      {loading && <div className="text-blue-600 font-semibold animate-pulse">Đang tải...</div>}
      {error && <div className="text-red-500 font-semibold animate-pulse">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {Array.isArray(filteredJobs) && filteredJobs.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">Không có công việc phù hợp.</div>
        ) : (
          (Array.isArray(filteredJobs) ? filteredJobs : []).map(job => (
            <div
              key={job._id}
              className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-7 flex flex-col gap-3 hover:shadow-blue-300 hover:border-blue-400 hover:scale-[1.025] transition-all duration-200 cursor-pointer h-full group animate-fade-in-down"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex-1 w-full">
                <div className="font-extrabold text-2xl text-blue-700 mb-2 group-hover:text-blue-900 transition">{job.title}</div>
                <div className="text-blue-500 text-base font-semibold mb-1">{job.companyName}</div>
                <div className="text-gray-500 text-sm mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {job.location}
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Lương: {job.salary}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Kinh nghiệm: {job.experienceLevel}</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">Hình thức: {job.jobType}</span>
                </div>
                <div className="text-gray-700 text-base line-clamp-2 mb-1">{job.description}</div>
              </div>
              <button
                className={`px-5 py-2 rounded-xl font-bold shadow-lg transition text-base mt-2 ${appliedJobs.includes(job._id) ? 'bg-red-600 hover:bg-red-800' : 'bg-green-600 hover:bg-green-800'} text-white focus:ring-2 focus:ring-blue-400`}
                onClick={e => {
                  e.stopPropagation();
                  if (appliedJobs.includes(job._id)) {
                    handleUnapply(job._id);
                  } else {
                    handleApply(job._id);
                  }
                }}
              >
                {appliedJobs.includes(job._id) ? 'Hủy ứng tuyển' : 'Ứng tuyển'}
              </button>
            </div>
          ))
        )}
      </div>
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
  {Array.isArray(filteredJobs) && filteredJobs.length === 0 && !loading && <div className="text-gray-500 italic">Không có bài tuyển dụng nào.</div>}
      {selectedJob && <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showApplySuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-[9999] font-bold text-lg animate-fade-in-down">
          Ứng tuyển thành công!
        </div>
      )}
    </>
  );
}
