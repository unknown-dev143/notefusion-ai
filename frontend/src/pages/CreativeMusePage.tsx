import React from 'react';
import CreativeMuse from '../components/CreativeMuse';

const CreativeMusePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Creative Muse</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">Discover hidden connections and new ideas</p>
        </div>
        <CreativeMuse />
      </div>
    </div>
  );
};

export default CreativeMusePage;
