import React, { useState } from 'react';

const API_URL = 'http://localhost:5000/api/auth';

type AuthFormProps = {
  onAuth?: (user: any) => void;
};

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const body = isLogin ? { email: form.email, password: form.password } : form;
      const res = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error');
      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuth && onAuth(data.user);
      } else {
        setIsLogin(true);
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-2xl shadow-2xl border border-blue-200 animate-fade-in-down">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <>
            <div className="relative">
              <input name="username" value={form.username} onChange={handleChange} placeholder="Tên người dùng" className="w-full p-3 pl-10 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" required />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
            </div>
            <select name="role" value={form.role} onChange={handleChange} className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all">
              <option value="candidate">Ứng viên</option>
              <option value="employer">Nhà tuyển dụng</option>
            </select>
          </>
        )}
        <div className="relative">
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-3 pl-10 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" required />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
          </span>
        </div>
        <div className="relative">
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mật khẩu" className="w-full p-3 pl-10 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition-all" required />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm6 0c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3z" /></svg>
          </span>
        </div>
        {error && <div className="text-red-500 text-sm text-center animate-pulse">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
          {loading && <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button className="text-blue-700 font-semibold hover:underline hover:text-blue-900 transition" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
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
