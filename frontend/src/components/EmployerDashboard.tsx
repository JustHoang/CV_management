
import React, { useState, useEffect } from 'react';
import CVList from './CVList';
import JobManager from './JobManager';

export default function EmployerDashboard({ user, search, showJobManager, onBackJobManager }: {
  user: any,
  search?: string,
  showJobManager?: boolean,
  onBackJobManager?: () => void
}) {

  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [searchFilter, setSearchFilter] = useState({});
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [allExperiences, setAllExperiences] = useState<string[]>([]);

  useEffect(() => {
    // Lấy tất cả kỹ năng và kinh nghiệm từ các CV
    fetch('http://localhost:5000/api/cv/all?page=1&pageSize=1000', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          const skillsSet = new Set<string>();
          const expSet = new Set<string>();
          data.data.forEach((cv: any) => {
            (cv.skills || []).forEach((s: string) => skillsSet.add(s));
            (cv.experience || []).forEach((e: any) => {
              if (e.position) expSet.add(e.position);
            });
          });
          setAllSkills(Array.from(skillsSet));
          setAllExperiences(Array.from(expSet));
        }
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const s: any = {};
    if (selectedSkill) s.skills = selectedSkill;
    if (selectedExperience) s.experience = selectedExperience;
    setSearchFilter(s);
  };

  return (
    <>
      <form className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-end p-4 rounded-2xl shadow-lg border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-100 animate-fade-in-down" onSubmit={handleSearch} style={{ maxWidth: 800, marginLeft: 'auto' }}>
        <div className="flex items-center gap-2 w-full max-w-xs">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v4H8z" /></svg>
          <select
            className="p-2 border-2 border-blue-300 rounded-xl flex-1 min-w-0 text-base focus:ring-2 focus:ring-blue-400 transition"
            value={selectedSkill}
            onChange={e => setSelectedSkill(e.target.value)}
          >
            <option value="">Chọn kỹ năng...</option>
            {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full max-w-xs">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414m12.728 0l-1.414-1.414M6.05 6.05L4.636 4.636" /></svg>
          <select
            className="p-2 border-2 border-green-300 rounded-xl flex-1 min-w-0 text-base focus:ring-2 focus:ring-green-400 transition"
            value={selectedExperience}
            onChange={e => setSelectedExperience(e.target.value)}
          >
            <option value="">Chọn kinh nghiệm...</option>
            {(() => {
              const sorted = [...allExperiences];
              sorted.sort((a, b) => {
                const getNum = (str: string) => {
                  const m = str.match(/(\d+)/);
                  return m ? parseInt(m[1]) : 999;
                };
                const aNum = getNum(a);
                const bNum = getNum(b);
                if ((/0|1/.test(a) && /0|1/.test(b))) return aNum - bNum;
                if (/0|1/.test(a)) return -1;
                if (/0|1/.test(b)) return 1;
                return aNum - bNum;
              });
              return sorted.map(e => <option key={e} value={e}>{e}</option>);
            })()}
          </select>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-bold shadow-lg hover:from-blue-800 hover:to-blue-600 transition text-base focus:ring-2 focus:ring-blue-400"
          tabIndex={0}
          style={{ minWidth: 120 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
          Tìm kiếm
        </button>
      </form>
  <CVList search={searchFilter} />
    </>
  );
}
