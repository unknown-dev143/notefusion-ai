import React from 'react';
import { Link } from 'react-router-dom';
import MainFeatures from '../components/MainFeatures';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg p-8 shadow-lg animate-slide-in">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-3 animate-bounce-slow">
            🌍 Welcome to NoteFusion AI
          </h1>
          <p className="text-2xl mb-4 opacity-90">
            Free & Open Access for Everyone Worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <span className="font-semibold">✨ 100% Free</span>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <span className="font-semibold">🌐 International</span>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <span className="font-semibold">🚀 No Login Required</span>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
              <span className="font-semibold">💎 All Features Unlocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Quick Start</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">📤</div>
            <h3 className="font-semibold text-gray-800">1. Upload Files</h3>
            <p className="text-sm text-gray-600">Upload PDFs, audio, or video files</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-800">2. Generate Notes</h3>
            <p className="text-sm text-gray-600">AI creates comprehensive study notes</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">📥</div>
            <h3 className="font-semibold text-gray-800">3. Export & Share</h3>
            <p className="text-sm text-gray-600">Download or save to cloud</p>
          </div>
        </div>
      </div>

      <MainFeatures />
    </div>
  );
};

export default Dashboard;

