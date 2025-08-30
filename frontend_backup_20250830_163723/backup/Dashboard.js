import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  PlusIcon, 
  FolderIcon, 
  ClockIcon, 
  AcademicCapIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';
import TestComponent from '../components/TestComponent';
import GoogleLogin from '../components/GoogleLogin';

const Dashboard = () => {
  const { data: sessions, isLoading } = useQuery('sessions', apiService.getSessions, {
    onError: (error) => {
      toast.error('Failed to load sessions');
    }
  });

  const stats = [
    {
      name: 'Total Sessions',
      value: sessions?.sessions?.length || 0,
      icon: FolderIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Study Time',
      value: '2.5h',
      icon: ClockIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Modules',
      value: '3',
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Notes Generated',
      value: sessions?.sessions?.length || 0,
      icon: DocumentTextIcon,
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    {
      name: 'Start New Session',
      description: 'Create a new study session with lecture and textbook content',
      icon: PlusIcon,
      path: '/new',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'View Sessions',
      description: 'Browse and manage your existing study sessions',
      icon: FolderIcon,
      path: '/sessions',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Live Recording',
      description: 'Start recording a lecture in real-time',
      icon: MicrophoneIcon,
      path: '/new?mode=recording',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      name: 'Analytics',
      description: 'View your study progress and insights',
      icon: ChartBarIcon,
      path: '/analytics',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  const recentSessions = sessions?.sessions?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to NoteFusion AI
        </h1>
        <GoogleLogin />
<TestAuth />
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transform your lectures and textbooks into intelligent, structured study notes. 
          Upload files, record live lectures, and let AI create comprehensive study materials.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.path}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
                    <p className="text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
          <Link
            to="/sessions"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </Link>
        </div>
        
        {isLoading ? (
          <div className="card">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <Link
                key={session.session_id}
                to={`/session/${session.session_id}`}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.module_code}</h3>
                    <p className="text-sm text-gray-600">{session.chapters}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {session.detail_level}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-600 mb-4">
              Start your first study session to see it here
            </p>
            <Link
              to="/new"
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Session
            </Link>
          </div>
        )}
      </div>

      {/* Features Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MicrophoneIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Live Recording</h3>
            <p className="text-sm text-gray-600">Record lectures in real-time with automatic transcription</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Smart Fusion</h3>
            <p className="text-sm text-gray-600">Combine lecture and textbook content intelligently</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AcademicCapIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Study Tools</h3>
            <p className="text-sm text-gray-600">Generate practice questions, flashcards, and summaries</p>
          </div>
        </div>
      </div>

      {/* Test Component */}
      <TestComponent />
    </div>
  );
};

export default Dashboard; 