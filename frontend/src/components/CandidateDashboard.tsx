import React from 'react';
import JobList from './JobList';

export default function CandidateDashboard({ user, onManageCV, search }: { user: any, onManageCV: () => void, search?: string }) {
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-2xl shadow-2xl border border-blue-200 animate-fade-in-down">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 text-base font-bold rounded bg-blue-100 text-blue-700 border border-blue-300 shadow gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Ứng viên
          </span>
          <span className="text-xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow">Chào, {user?.username || 'Ứng viên'}!</span>
        </div>
      </div>
      <JobList />
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
