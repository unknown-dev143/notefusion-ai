import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../features/auth/services/authService';
import { useAuth } from '../features/auth/context/AuthContext';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithGithub } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.register({ email, password, name, username: name });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGithub();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `${provider} registration failed`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background Decors */}
       <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px]"></div>
       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[120px]"></div>

       <div className="w-full max-w-[550px] bg-white rounded-[48px] shadow-2xl p-12 lg:p-16 relative z-10 border border-slate-100">
          <div className="text-center mb-12">
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 mx-auto mb-6 transition-transform hover:rotate-12">✨</div>
             <h2 className="text-3xl font-black text-slate-900 mb-2">Join the Fusion</h2>
             <p className="font-bold text-slate-400 text-xs uppercase tracking-widest px-4">Begin your automated research journey</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-shake">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Scholar Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all border border-slate-100" 
                  placeholder="e.g. Isaac Newton"
                  required
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Academic Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all border border-slate-100" 
                  placeholder="scholar@notefusion.ai"
                  required
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Secret Key (Password)</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all border border-slate-100" 
                  placeholder="Min. 8 characters"
                  required
                />
             </div>

             <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all mb-6"
                >
                  {isLoading ? 'Creating Identity...' : 'Generate Scholar Account'}
                </button>

                <div className="relative my-8">
                   <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-slate-100"></div>
                   </div>
                   <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                     <span className="bg-white px-4 text-slate-400">Or Neural Link via</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                   <button 
                     type="button"
                     onClick={() => handleSocialSignup('google')}
                     disabled={isLoading}
                     className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all active:scale-95"
                   >
                     <span className="text-lg">G</span>
                     <span>Google</span>
                   </button>
                   <button 
                     type="button"
                     onClick={() => handleSocialSignup('github')}
                     disabled={isLoading}
                     className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all active:scale-95"
                   >
                     <span className="text-lg">🗄️</span>
                     <span>Github</span>
                   </button>
                </div>

                <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">By joining, you agree to the Scholar Nexus Terms</p>
             </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center text-sm font-bold text-slate-400">
             Already a member? <Link to="/login" className="text-blue-600 hover:underline">Sign in to vault</Link>
          </div>
       </div>
    </div>
  );
};

export default Signup;
