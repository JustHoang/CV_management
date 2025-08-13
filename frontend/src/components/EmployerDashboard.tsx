
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
      <form
        className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-end p-4 rounded-2xl shadow-lg border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-blue-100 animate-fade-in-down"
        onSubmit={handleSearch}
        style={{ maxWidth: 800, marginLeft: 'auto' }}
      >
        <div className="relative w-full max-w-[220px]">
          <select
            className="pl-4 pr-8 py-3 border-2 border-blue-300 rounded-2xl w-full text-base focus:ring-4 focus:ring-blue-300 transition bg-white shadow-sm appearance-none hover:border-blue-400 hover:shadow-md cursor-pointer outline-none"
            value={selectedSkill}
            onChange={e => setSelectedSkill(e.target.value)}
          >
            <option value="">Chọn kỹ năng...</option>
            {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <svg className="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
        <div className="relative w-full max-w-[180px]">
          <select
            className="pl-4 pr-8 py-3 border-2 border-blue-300 rounded-2xl w-full text-base focus:ring-4 focus:ring-blue-300 transition bg-white shadow-sm appearance-none hover:border-blue-400 hover:shadow-md cursor-pointer outline-none"
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
      <CVList search={searchFilter} />
    </>
  );
}
