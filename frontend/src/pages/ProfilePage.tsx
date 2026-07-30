import React, { useState, useEffect } from 'react';

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('Premium Scholar');
  const [email, setEmail] = useState('scholar@notefusion.ai');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) return <div className="p-20 text-center font-black text-slate-200 animate-pulse text-4xl">FUSING PROFILE...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-slide-up">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Col: Avatar & Status */}
        <div className="lg:w-80 space-y-8">
           <div className="bg-white border border-slate-100 rounded-[40px] p-10 text-center shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="relative mb-6 inline-block">
                <img 
                  src="https://ui-avatars.com/api/?name=Premium+Scholar&background=020617&color=fff&size=200" 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-[32px] mx-auto border-4 border-white shadow-xl group-hover:scale-105 transition-transform"
                />
                <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-600 shadow-lg transition-all">
                  📷
                  <input type="file" className="hidden" />
                </label>
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-1">{name}</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 py-1.5 px-4 rounded-full inline-block">Pro Research Tier</p>
              
              <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scholar Score</p>
                    <p className="text-xl font-black text-slate-800">12,402</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expertise</p>
                    <p className="text-xl font-black text-slate-800">Lvl 42</p>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-10 text-white">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Expertise Domains</h3>
              <div className="space-y-4">
                 {[
                   { domain: 'Neural Science', val: '80%' },
                   { domain: 'Discrete Math', val: '65%' },
                   { domain: 'Quantum Phys', val: '40%' },
                 ].map(d => (
                   <div key={d.domain} className="group cursor-default">
                      <div className="flex justify-between text-[10px] font-black mb-2 opacity-60">
                        <span>{d.domain}</span>
                        <span>{d.val}</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[var(--val)] transition-all duration-1000" style={{ '--val': d.val } as any}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Col: Edit Form */}
        <div className="flex-1 space-y-8">
           <div className="bg-white border border-slate-100 rounded-[40px] p-12 shadow-sm">
             <h3 className="text-2xl font-black text-slate-800 mb-8 px-2">Knowledge Identity</h3>
             <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Public Name</label>
                     <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all" 
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Academic Email</label>
                     <input 
                      type="email" 
                      value={email}
                      disabled
                      className="w-full p-5 bg-slate-50/50 text-slate-400 cursor-not-allowed rounded-2xl font-bold text-sm outline-none" 
                     />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bio / Research Focus</label>
                   <textarea 
                    rows={4}
                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                    placeholder="Tell your collaborators what you are working on..."
                   ></textarea>
                </div>

                <div className="pt-8 flex justify-end gap-4">
                   <button type="button" className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Reset Changes</button>
                   <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all">Save Profile</button>
                </div>
             </form>
           </div>

           <div className="bg-rose-50/20 border border-rose-100 rounded-[40px] p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                    <h3 className="text-xl font-black text-rose-600 mb-1">Deactive Workspace</h3>
                    <p className="text-xs font-medium text-rose-500/60 max-w-md">Once you deactivate your profile, all synthesized knowledge, whiteboard assets, and collaborative history will be archived permanently.</p>
                 </div>
                 <button className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all">Initiate Archival</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
