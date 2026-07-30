import React, { useState, useEffect } from 'react';

const StudyPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or notify
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  /* New State for Audio and Tasks */
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [tasks, setTasks] = useState<{ id: number; text: string; completed: boolean }[]>([
    { id: 1, text: 'Finish Week 4 synthesis', completed: false },
    { id: 2, text: 'Review Flashcards', completed: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const sounds = [
    { id: 'rain', label: 'Lo-Fi Rain', icon: '🌧️', url: 'https://www.soundjay.com/nature/rain-01.mp3' },
    { id: 'white_noise', label: 'White Noise', icon: '🌫️', url: 'https://actions.google.com/sounds/v1/ambiences/white_noise.ogg' }, // Fallback to nature if fails
    { id: 'coffee', label: 'Coffee Shop', icon: '☕', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
    { id: 'waves', label: 'Ocean Waves', icon: '🌊', url: 'https://www.soundjay.com/nature/ocean-wave-1.mp3' },
  ];

  /* Audio Effect */
  useEffect(() => {
    if (activeSound) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
      }
      const sound = sounds.find(s => s.id === activeSound);
      if (sound && audioRef.current.src !== sound.url) {
        audioRef.current.src = sound.url;
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      } else if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [activeSound]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
      setIsAddingTask(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-slide-up">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Focus Timer */}
        <div className="flex-1">
          <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden">
             {/* Abstract Background Decor */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
             
             <div className="relative z-10 transition-all">
                <div className="inline-flex gap-2 p-1 bg-slate-100 rounded-2xl mb-12">
                   <button 
                    onClick={() => { setMode('focus'); setTimeLeft(25*60); setIsActive(false); }}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'focus' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Focus
                   </button>
                   <button 
                    onClick={() => { setMode('break'); setTimeLeft(5*60); setIsActive(false); }}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'break' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     Short Break
                   </button>
                </div>

                <div className="text-[120px] font-black text-slate-900 leading-none mb-4 tabular-nums tracking-tighter">
                  {formatTime(timeLeft)}
                </div>
                
                <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-12">
                  {mode === 'focus' ? 'Time to concentrate' : 'Rest and recharge'}
                </p>

                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={toggleTimer}
                    className={`px-12 py-5 rounded-[32px] font-black text-lg transition-all shadow-xl ${isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-600 text-white shadow-blue-200 hover:scale-105 active:scale-95'}`}
                  >
                    {isActive ? 'Pause Session' : 'Start Focus'}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center text-2xl hover:bg-slate-100 transition-all"
                  >
                    🔄
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Study Utilities */}
        <div className="lg:w-96 space-y-6">
           {/* Ambient Sound Card */}
           <div className="bg-slate-900 rounded-[40px] p-8 text-white h-fit">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 px-2">Focus Audio</h3>
              <div className="space-y-3">
                {sounds.map((sound) => (
                  <button 
                    key={sound.id}
                    onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
                    className={`flex items-center justify-between w-full p-4 rounded-3xl transition-all ${activeSound === sound.id ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{sound.icon}</span>
                      <span className="font-bold text-sm tracking-tight">{sound.label}</span>
                    </div>
                    {activeSound === sound.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                  </button>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Volume</span>
                  <span className="text-[10px] font-black text-blue-400">{Math.round(volume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
           </div>

           {/* Goals Card */}
           <div className="bg-white border border-slate-100 rounded-[40px] p-8">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 px-2">Session Goals</h3>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                 {tasks.map(task => (
                   <div 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl group cursor-pointer transition-all ${task.completed ? 'bg-slate-50 opacity-60' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                   >
                      <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-200 group-hover:border-blue-500'}`}>
                        {task.completed && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className={`text-sm font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                        {task.text}
                      </span>
                   </div>
                 ))}
              </div>
              
              {isAddingTask ? (
                <form onSubmit={addTask} className="mt-6">
                  <input
                    autoFocus
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Type task..."
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold text-slate-700"
                    onBlur={() => !newTask && setIsAddingTask(false)}
                  />
                </form>
              ) : (
                <button 
                  onClick={() => setIsAddingTask(true)}
                  className="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-500 transition-all"
                >
                  + Add Task
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
