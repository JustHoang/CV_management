import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-100 via-white to-blue-200 border-t border-blue-200 py-6 mt-12 shadow-inner animate-fade-in-down">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-2 text-blue-700 font-bold text-lg">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
          CV Management
        </div>
        <div className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} JustHoang. All rights reserved.</div>
        <div className="flex gap-3">
          <a href="https://github.com/JustHoang/CV_management" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-800 transition font-semibold underline">GitHub</a>
          <a href="mailto:support@example.com" className="text-blue-500 hover:text-blue-800 transition font-semibold underline">Liên hệ</a>
        </div>
      </div>
    </footer>
  );
}
