import React from 'react';

type JobDetailProps = {
  job: any;
  onClose: () => void;
  onApplied?: () => void;
};

export default function JobDetail({ job, onClose, onApplied }: JobDetailProps) {
  const [applyStatus, setApplyStatus] = React.useState<string>("");
  if (!job) return null;
  const handleApply = async () => {
    setApplyStatus("");
    try {
      const res = await fetch(`http://localhost:5000/api/job/${job._id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi nộp đơn');
      setApplyStatus('Nộp đơn thành công!');
      if (onApplied) onApplied();
    } catch (err: any) {
      setApplyStatus(err.message || 'Lỗi nộp đơn');
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-down">
      <div className="bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-3xl shadow-2xl border-2 border-blue-300 p-8 w-full max-w-2xl relative" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <button className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-4xl font-extrabold rounded-full bg-white bg-opacity-80 w-12 h-12 flex items-center justify-center shadow-lg transition" onClick={onClose} aria-label="Đóng">×</button>
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
          {job.companyLogo && <img src={job.companyLogo} alt="logo" className="w-28 h-28 object-contain rounded-full border-4 border-blue-400 shadow-xl bg-white" />}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow-lg">{job.title}</h2>
            <div className="mb-2 text-xl text-blue-700 font-bold flex items-center justify-center sm:justify-start gap-2"><svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> {job.company}</div>
            {job.companyWebsite && <div className="mb-1 text-blue-600 flex items-center justify-center sm:justify-start gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0v4m0 8v4m8-8h-4m-8 0H3" /></svg> <a href={job.companyWebsite} className="underline font-semibold" target="_blank" rel="noopener noreferrer">{job.companyWebsite}</a></div>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Mô tả công việc</div>
            <div className="text-gray-700 whitespace-pre-line max-h-60 overflow-auto pr-2 text-base">{job.description}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Yêu cầu</div>
            <div className="text-gray-700 whitespace-pre-line text-base">{job.requirements || 'Không yêu cầu cụ thể.'}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Lương</div>
            <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-base">{job.salary || 'Thỏa thuận'}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Phúc lợi</div>
            <div className="text-gray-700 text-base">{job.benefits || 'Không có thông tin.'}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Địa điểm</div>
            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-base">{job.location || 'Không xác định'}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Hình thức</div>
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-base">{job.jobType || 'Không xác định'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Kinh nghiệm</div>
            <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold text-base">{job.experienceLevel || 'Không yêu cầu'}</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Hạn nộp</div>
            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold text-base">{job.deadline || 'Không xác định'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Liên hệ</div>
            <div className="text-gray-700 text-base">{job.contact || 'Không có thông tin.'}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
            <div className="font-bold text-blue-700 mb-2 text-lg">Tags</div>
            <div className="text-gray-700 text-base">{job.tags?.length > 0 ? job.tags.join(', ') : 'Không có'}</div>
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-extrabold rounded-2xl shadow-xl hover:from-green-700 hover:to-blue-700 transition text-xl focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
            onClick={handleApply}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a5.25 5.25 0 11-7.424 7.426M12 21v-9m0 0l-3.5 3.5M12 12l3.5 3.5" />
            </svg>
            Ứng tuyển ngay
          </button>
        </div>
        {applyStatus && (
          <div className={`mt-4 text-center font-semibold ${applyStatus.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>{applyStatus}</div>
        )}
        <style>{`
          @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-down { animation: fade-in-down 0.5s; }
        `}</style>
      </div>
    </div>
  );
}
