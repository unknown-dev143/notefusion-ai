import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">NoteFusion AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {currentUser?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Welcome to NoteFusion AI</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/whiteboard"
              className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-medium mb-2">Whiteboard</h3>
              <p className="text-sm text-gray-600">Create and manage your notes with our interactive whiteboard.</p>
            </Link>
            
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-2">Recent Notes</h3>
              <p className="text-sm text-gray-600">Your recent notes will appear here.</p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/whiteboard" className="text-indigo-600 hover:underline">
                    New Whiteboard
                  </Link>
                </li>
                <li>
                  <button className="text-indigo-600 hover:underline">
                    Upload File
                  </button>
                </li>
                <li>
                  <button className="text-indigo-600 hover:underline">
                    Start Recording
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
