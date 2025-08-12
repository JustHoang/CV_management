import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [open, setOpen] = React.useState(false);
  const logoUrl = user && user.role === 'employer' && user.companyLogo
    ? (user.companyLogo.startsWith('/uploads/') ? `http://localhost:5000${user.companyLogo}` : user.companyLogo)
    : user && user.avatar
      ? (user.avatar.startsWith('/uploads/') ? `http://localhost:5000${user.avatar}` : user.avatar)
      : null;

  // Đóng dropdown khi click ngoài
  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (!e.target.closest('.dropdown-user')) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <nav className="sticky top-0 w-full z-50 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white px-6 py-3 flex items-center justify-between shadow-lg rounded-b-xl animate-fade-in-down">
      <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-wide drop-shadow-lg hover:scale-105 transition-transform duration-200">
        <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fff" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 16h8M8 8h8" /></svg>
        CV Management
      </Link>
      <div className="flex items-center gap-4 relative">
        {user && user.role === 'candidate' && (
          <>
            <Link to="/cv" className="px-6 py-2 rounded-2xl font-extrabold bg-gradient-to-r from-green-200 via-green-300 to-blue-200 text-green-900 shadow-xl border-2 border-white ring-2 ring-green-200 hover:from-green-300 hover:via-green-400 hover:to-blue-300 hover:scale-105 hover:brightness-110 transition-all duration-200">Quản lý CV</Link>
            <Link to="/applied-companies" className="px-6 py-2 rounded-2xl font-extrabold bg-gradient-to-r from-green-200 via-green-300 to-blue-200 text-green-900 shadow-xl border-2 border-white ring-2 ring-green-200 hover:from-green-300 hover:via-green-400 hover:to-blue-300 hover:scale-105 hover:brightness-110 transition-all duration-200">Công ty đã ứng tuyển</Link>
          </>
        )}
        {user && user.role === 'employer' && (
          <>
            <Link to="/jobs" className="px-6 py-2 rounded-2xl font-extrabold bg-gradient-to-r from-green-200 via-green-300 to-blue-200 text-green-900 shadow-xl border-2 border-white ring-2 ring-green-200 hover:from-green-300 hover:via-green-400 hover:to-blue-300 hover:scale-105 hover:brightness-110 transition-all duration-200">Quản lý bài tuyển dụng</Link>
            <Link to="/applied-candidates" className="px-6 py-2 rounded-2xl font-extrabold bg-gradient-to-r from-green-200 via-green-300 to-blue-200 text-green-900 shadow-xl border-2 border-white ring-2 ring-green-200 hover:from-green-300 hover:via-green-400 hover:to-blue-300 hover:scale-105 hover:brightness-110 transition-all duration-200">Ứng viên đã ứng tuyển</Link>
          </>
        )}
        {user && (
          <div className="relative dropdown-user">
            <button
              className="flex items-center focus:outline-none group"
              onClick={() => setOpen(o => !o)}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md group-hover:ring-2 group-hover:ring-yellow-300 transition-all duration-200" />
              ) : (
                <span className="inline-block h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 via-white to-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg shadow-md group-hover:ring-2 group-hover:ring-yellow-300 transition-all duration-200">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
              )}
              <svg className="ml-1 w-5 h-5 text-yellow-300 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div
              className={`absolute right-0 mt-2 w-44 bg-white text-black rounded-xl shadow-xl z-50 transition-all duration-200 origin-top-right ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} animate-dropdown`}
              style={{ minWidth: 160 }}
            >
              <Link to="/profile" className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 rounded-t-xl font-semibold transition-colors duration-150" onClick={() => setOpen(false)}>Trang cá nhân</Link>
              <button onClick={() => { setOpen(false); onLogout(); }} className="block w-full text-left px-5 py-3 hover:bg-blue-50 hover:text-red-600 rounded-b-xl font-semibold transition-colors duration-150">Đăng xuất</button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s; }
        @keyframes dropdown {
          0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-dropdown { animation: dropdown 0.25s; }
      `}</style>
    </nav>
  );
}