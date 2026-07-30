import React from 'react';
import SocraticTutor from '../components/SocraticTutor';

const SocraticTutorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Socratic Tutor</h1>
          <p className="text-slate-500 font-medium">Learn through guided questioning</p>
        </div>
        <SocraticTutor />
      </div>
    </div>
  );
};

export default SocraticTutorPage;
