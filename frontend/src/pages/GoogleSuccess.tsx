import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store JWT token for future backend API requests
      localStorage.setItem('authToken', token);
      localStorage.setItem('notefusion_auth', JSON.stringify({
        user: {
          id: 'google_user',
          email: 'google_user@notefusion.ai',
          name: 'Google User',
          role: 'user',
          emailVerified: true,
          token,
        },
        token,
      }));
      toast.success('Logged in with Google!');
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      toast.error('Google login failed: Token missing.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-slate-300">Completing Google Sign-In...</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
