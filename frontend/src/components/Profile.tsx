import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/user';

export default function Profile({ user, onLogout, onUpdateUser }: { user: any, onLogout: () => void, onUpdateUser?: (u: any) => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    avatar: '',
    dob: '',
    gender: '',
    address: '',
    phone: '',
    companyName: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const u = stored ? JSON.parse(stored) : user;
    if (u) {
      setProfile(u);
      setForm({
        username: u.username || '',
        email: u.email || '',
        avatar: u.avatar || '',
        dob: u.dob || '',
        gender: u.gender || '',
        address: u.address || '',
        phone: u.phone || '',
        companyName: u.companyName || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setMessage('');
    const userId = (profile && (profile.id || profile._id)) || (user && user.id);
    if (!userId) {
      setMessage('Không xác định được tài khoản. Đang đăng xuất...');
      setTimeout(() => {
        if (onLogout) onLogout();
      }, 1200);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');
      setProfile(data.user);
      if (onUpdateUser) {
        onUpdateUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setEdit(false);
      setMessage('Cập nhật thành công!');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Lỗi không xác định');
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-2xl shadow-2xl border border-blue-200 animate-fade-in-down">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 drop-shadow">Trang cá nhân</h2>
      {/* Hiển thị avatar cho ứng viên, logo công ty cho nhà tuyển dụng */}
      {profile.role === 'employer' && profile.companyLogo && (
        <div className="flex justify-center mb-6">
          <img
            src={profile.companyLogo.startsWith('/uploads/') ? `http://localhost:5000${profile.companyLogo}` : profile.companyLogo}
            alt="Logo công ty"
            className="h-28 w-28 rounded-full object-cover border-4 border-blue-300 shadow-lg"
          />
        </div>
      )}
      {profile.role !== 'employer' && profile.avatar && (
        <div className="flex justify-center mb-6">
          <img
            src={profile.avatar.startsWith('/uploads/') ? `http://localhost:5000${profile.avatar}` : profile.avatar}
            alt="Avatar"
            className="h-28 w-28 rounded-full object-cover border-4 border-blue-300 shadow-lg"
          />
        </div>
      )}
      {edit ? (
        <>
          <input name="username" value={form.username} onChange={handleChange} className="w-full p-2 border rounded mb-2" placeholder="Tên đăng nhập" />
          <input name="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded mb-2" placeholder="Email" />
          {profile.role === 'employer' && (
            <input name="companyName" value={form.companyName} onChange={handleChange} className="w-full p-2 border rounded mb-2" placeholder="Tên công ty" />
          )}
          <input name="dob" value={form.dob} onChange={handleChange} className="w-full p-2 border rounded mb-2" placeholder="Ngày sinh" type="date" />
          <input name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 border rounded mb-2" placeholder="Giới tính" />
          <input name="address" value={form.address} onChange={handleChange} className="w-full p-2 border rounded mb-2" placeholder="Địa chỉ" />
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded mb-2" placeholder="Số điện thoại" />
          {/* Avatar upload */}
          <input type="file" accept="image/*" className="w-full p-2 border rounded mb-2" onChange={async (e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              const formData = new FormData();
              formData.append('file', file);
              try {
                const res = await fetch('http://localhost:5000/api/upload/logo', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                  body: formData,
                });
                const data = await res.json();
                if (res.ok && data.url) {
                  setForm(f => ({ ...f, avatar: data.url }));
                  // Gọi API cập nhật user ngay sau khi upload avatar
                  if (user && user.id) {
                    await fetch(`http://localhost:5000/api/user/${user.id}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                      },
                      body: JSON.stringify({ avatar: data.url }),
                    });
                    // Fetch lại user mới nhất và cập nhật state + localStorage
                    const userRes = await fetch(`http://localhost:5000/api/user/${user.id}`, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    const userData = await userRes.json();
                    if (onUpdateUser) onUpdateUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    setProfile(userData);
                    setForm({
                      username: userData.username || '',
                      email: userData.email || '',
                      avatar: userData.avatar || '',
                      dob: userData.dob || '',
                      gender: userData.gender || '',
                      address: userData.address || '',
                      phone: userData.phone || '',
                      companyName: userData.companyName || '',
                    });
                  }
                }
              } catch {}
            }
          }} placeholder="Ảnh đại diện (tải ảnh)" />
          {form.avatar && (
            <img src={form.avatar.startsWith('/uploads/') ? `http://localhost:5000${form.avatar}` : form.avatar} alt="Avatar" className="h-12 mb-2 rounded-full" />
          )}
          <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={handleSave}>Lưu</button>
          <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEdit(false)}>Hủy</button>
        </>
      ) : (
        <>
          <div className="mb-2"><b>Tên đăng nhập:</b> {profile.username}</div>
          {profile.role === 'employer' && profile.companyName && (
            <div className="mb-2 text-blue-700 font-bold text-lg flex items-center gap-2">🏢 {profile.companyName}</div>
          )}
          <div className="mb-2"><b>Email:</b> {profile.email}</div>
          <div className="mb-2"><b>Ngày sinh:</b> {profile.dob}</div>
          <div className="mb-2"><b>Giới tính:</b> {profile.gender}</div>
          <div className="mb-2"><b>Địa chỉ:</b> {profile.address}</div>
          <div className="mb-2"><b>Số điện thoại:</b> {profile.phone}</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={() => setEdit(true)}>Chỉnh sửa</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onLogout}>Đăng xuất</button>
        </>
      )}
      {message && <div className="mt-2 text-center text-green-600">{message}</div>}
    </div>
  );
}