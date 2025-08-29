import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ActivityFeed } from '../components/ActivityFeed';
import '../styles/Dashboard.css'; // Using regular CSS instead of CSS modules

// Mock auth hook for demonstration
const useAuth = () => ({
  currentUser: { displayName: 'User', email: 'user@example.com' },
  signOut: async () => {}
});

interface Activity {
  id: string;
  type: 'note_created' | 'note_updated' | 'file_uploaded' | 'ai_generated';
  title: string;
  timestamp: Date;
  user: string;
  metadata?: Record<string, any>;
}

// Mock data for demonstration
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'note_created',
    title: 'Project Requirements',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    user: 'You',
  },
  {
    id: '2',
    type: 'ai_generated',
    title: 'Meeting Summary',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    user: 'AI Assistant',
    metadata: { aiModel: 'GPT-4' }
  },
  {
    id: '3',
    type: 'file_uploaded',
    title: 'presentation.pdf',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    user: 'You',
  },
  {
    id: '4',
    type: 'note_updated',
    title: 'Team Tasks',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    user: 'You',
  },
];

const Dashboard: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch activities from your API
    const fetchActivities = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setActivities(mockActivities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-inner">
            <div className="nav-left">
              <div className="logo">
                <h1 className="logo-text">NoteFusion AI</h1>
              </div>
              <div className="nav-links">
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="nav-right">
              <button
                onClick={handleSignOut}
                className="sign-out-button"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="dashboard-grid">
          <div className="welcome-card">
            <h2>Welcome back, {currentUser?.displayName || 'User'}</h2>
            <p>Here's what's been happening in your workspace.</p>
          </div>
          
          <div className="activity-section">
            {isLoading ? (
              <div>Loading activities...</div>
            ) : (
              <ActivityFeed activities={activities} maxItems={5} />
            )}
          </div>
          
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-button">
                <span>+</span> New Note
              </button>
              <button className="action-button">
                <span>📤</span> Upload File
              </button>
              <button className="action-button">
                <span>🤖</span> AI Tools
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
