import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../features/auth/services/authService';
import { useAuth } from '../features/auth/context/AuthContext';
import AnimatedLogo from '../components/layout/AnimatedLogo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithGithub, signInWithMicrosoft, forgotPassword } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fillDemoScholar = () => {
    setEmail('scholar@notefusion.ai');
    setPassword('notefusion2026');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    if (isResetting) {
      if (!email) {
        setError('Please enter your email to reset password');
        setIsLoading(false);
        return;
      }
      try {
        await forgotPassword(email);
        setSuccessMessage('Recovery instructions sent to your email.');
        setIsResetting(false);
      } catch (err: any) {
        setError(err.message || 'Failed to send reset instructions');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await authService.login({ email, password });
      // Store auth data so AuthContext (notefusion_auth key) picks it up
      const userData = response.user || {
        id: (response as any).user_id || 'demo-user-1',
        email,
        name: email.split('@')[0],
        role: 'user',
        emailVerified: true,
      };
      const token = response.access_token || response.token || (response as any).accessToken || 'demo-token';
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token);
      localStorage.setItem('notefusion_auth', JSON.stringify({ user: userData, token }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    setIsLoading(true);
    setError(null);
    try {
      if (provider === 'google') await signInWithGoogle();
      else if (provider === 'github') await signInWithGithub();
      else await signInWithMicrosoft();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `${provider} authentication failed`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract background decors */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full -mr-96 -mt-96 blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full -ml-40 -mb-40 blur-[100px]"></div>

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl overflow-hidden relative z-10 border border-slate-100">
         {/* Brand side */}
         <div className="bg-slate-900 p-16 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none text-[60px] font-black leading-none break-all p-4">
              FUSION AI RESEARCH SYNC SYNTESIZE KNOWLEDGE LEARN MASTER COLLABORATE
            </div>
            
            <div className="relative z-10">
               <AnimatedLogo size={64} className="mb-12 shadow-2xl shadow-blue-500/20" />
               <h1 className="text-4xl font-[900] tracking-tight mb-4">NoteFusion<span className="text-blue-500">AI</span></h1>
               <p className="text-slate-400 font-medium text-lg max-w-sm">The intelligent operating system for your academic journey.</p>
            </div>

            <div className="relative z-10">
               <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-blue-500">✓</div>
                     <p className="font-bold text-sm text-slate-300">Advanced GPT-4o Synthesis</p>
                  </div>
                  <div className="flex gap-4 items-center">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-blue-500">✓</div>
                     <p className="font-bold text-sm text-slate-300">Real-time Peer Collaboration</p>
                  </div>
                  <div className="flex gap-4 items-center">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-blue-500">✓</div>
                     <p className="font-bold text-sm text-slate-300">Knowledge Recovery Vault</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Form side */}
         <div className="p-16 lg:p-24 flex flex-col justify-center">
            <div className="mb-8">
               <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
               <p className="font-bold text-slate-400 text-sm uppercase tracking-widest">Access your knowledge engine</p>
            </div>

            {/* Quick Demo Login Preset Helper */}
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-indigo-900">Demo Scholar Account</div>
                <div className="text-[10px] text-indigo-600 font-mono">scholar@notefusion.ai / notefusion2026</div>
              </div>
              <button
                type="button"
                onClick={fillDemoScholar}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Auto Fill
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[11px] font-bold animate-shake">
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-[11px] font-bold animate-fade-in">
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Account Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all border border-slate-100" 
                    placeholder="scholar@notefusion.ai"
                    required
                  />
               </div>
               {!isResetting && (
                 <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                      <button 
                        type="button" 
                        onClick={() => { setIsResetting(true); setError(null); setSuccessMessage(null); }} 
                        className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all border border-slate-100" 
                      placeholder="••••••••"
                      required={!isResetting}
                    />
                 </div>
               )}

               <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
               >
                 {isLoading ? 'Processing...' : (isResetting ? 'Send Recovery Protocol' : 'Sign In To Vault')}
               </button>

               {isResetting && (
                 <button 
                   type="button"
                   onClick={() => { setIsResetting(false); setError(null); }}
                   className="w-full py-4 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                 >
                   ← Return to Login
                 </button>
               )}

               {!isResetting && (
                 <>
                   <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                        <span className="bg-white px-4 text-slate-400">Or Neural Link via</span>
                      </div>
                   </div>

               <div className="grid grid-cols-3 gap-4">
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className={`flex flex-col items-center justify-center gap-2 py-4 border border-slate-100 rounded-2xl font-bold text-[10px] hover:bg-slate-50 transition-all active:scale-95 group ${isLoading ? 'opacity-50 grayscale' : ''}`}
                    title="Sign in with Google"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">G</span>
                    <span className="hidden md:inline uppercase tracking-widest leading-none">{isLoading ? '...' : 'Google'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                    className={`flex flex-col items-center justify-center gap-2 py-4 border border-slate-100 rounded-2xl font-bold text-[10px] hover:bg-slate-50 transition-all active:scale-95 group ${isLoading ? 'opacity-50 grayscale' : ''}`}
                    title="Sign in with Github"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">🗄️</span>
                    <span className="hidden md:inline uppercase tracking-widest leading-none">{isLoading ? '...' : 'Github'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('microsoft')}
                    disabled={isLoading}
                    className={`flex flex-col items-center justify-center gap-2 py-4 border border-slate-100 rounded-2xl font-bold text-[10px] hover:bg-slate-50 transition-all active:scale-95 group ${isLoading ? 'opacity-50 grayscale' : ''}`}
                    title="Sign in with Microsoft"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10h-10z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10h-10z"/>
                    </svg>
                    <span className="hidden md:inline uppercase tracking-widest leading-none">{isLoading ? '...' : 'Microsoft'}</span>
                  </button>
               </div>
                 </>
               )}
            </form>

            <div className="mt-12 pt-8 border-t border-slate-50 text-center">
               <p className="text-sm font-bold text-slate-400">
                 New researcher? <Link to="/signup" className="text-blue-600 hover:underline">Join the fusion</Link>
               </p>
               <div className="pt-2">
                 <button 
                   onClick={() => navigate('/playground')}
                   className="px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
                 >
                   🚀 Enter Neural Sandbox (Guest)
                 </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;
