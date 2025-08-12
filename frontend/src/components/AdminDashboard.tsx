import React from 'react';

export default function AdminDashboard({ user }: { user: any }) {
  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-2xl shadow-2xl border border-blue-200 animate-fade-in-down text-center">
      <div className="flex flex-col items-center gap-2 mb-6">
        <span className="inline-flex items-center px-4 py-2 text-lg font-bold rounded bg-blue-100 text-blue-700 border border-blue-300 shadow gap-2">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-10 0v6a2 2 0 002 2h4a2 2 0 002-2v-6m-6 0h6" /></svg>
          Quản trị Admin
        </span>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-transparent bg-clip-text drop-shadow mt-2">Xin chào, <span className="font-bold">{user.username}</span>!</h1>
      </div>
      <div className="mt-4 text-lg text-gray-700">
        <span className="inline-flex items-center px-3 py-1 text-base font-semibold rounded bg-green-100 text-green-700 border border-green-300 gap-2 mb-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" /></svg>
          Quản lý người dùng, CV, bài tuyển dụng, thống kê...
        </span>
      </div>
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
