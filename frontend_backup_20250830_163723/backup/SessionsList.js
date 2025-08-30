<<<<<<< HEAD
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FolderIcon, 
  ClockIcon, 
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const SessionsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const { data: sessionsData, isLoading, error } = useQuery('sessions', apiService.getSessions, {
    onError: (error) => {
      toast.error('Failed to load sessions');
    }
  });

  const sessions = sessionsData?.sessions || [];

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = session.module_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.chapters.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = !filterModule || session.module_code === filterModule;
      return matchesSearch && matchesModule;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'module') {
        return a.module_code.localeCompare(b.module_code);
      }
      return 0;
    });

  const uniqueModules = [...new Set(sessions.map(s => s.module_code))];

  const getDetailLevelColor = (level) => {
    switch (level) {
      case 'concise':
        return 'bg-green-100 text-green-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'in-depth':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Sessions</h1>
          <p className="text-gray-600">Browse and manage your study sessions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load sessions</h3>
        <p className="text-gray-600 mb-4">Please try refreshing the page</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Sessions</h1>
        <p className="text-gray-600">Browse and manage your study sessions</p>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Module Filter */}
          <div className="md:w-48">
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="input-field"
            >
              <option value="">All Modules</option>
              {uniqueModules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="date">Sort by Date</option>
              <option value="module">Sort by Module</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Link
              key={session.session_id}
              to={`/session/${session.session_id}`}
              className="card hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {session.module_code}
                  </h3>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDetailLevelColor(session.detail_level)}`}>
                  {session.detail_level}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{session.chapters}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FolderIcon className="w-4 h-4" />
                  <span>View</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {sessions.length === 0 ? 'No sessions yet' : 'No sessions match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {sessions.length === 0 
              ? 'Start your first study session to see it here'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {sessions.length === 0 && (
            <Link
              to="/new"
              className="btn-primary inline-flex items-center"
            >
              <AcademicCapIcon className="w-4 h-4 mr-2" />
              Create Session
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{uniqueModules.length}</div>
              <div className="text-sm text-gray-600">Unique Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sessions.filter(s => s.detail_level === 'in-depth').length}
              </div>
              <div className="text-sm text-gray-600">In-depth Sessions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

=======
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FolderIcon, 
  ClockIcon, 
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const SessionsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const { data: sessionsData, isLoading, error } = useQuery('sessions', apiService.getSessions, {
    onError: (error) => {
      toast.error('Failed to load sessions');
    }
  });

  const sessions = sessionsData?.sessions || [];

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = session.module_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.chapters.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = !filterModule || session.module_code === filterModule;
      return matchesSearch && matchesModule;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'module') {
        return a.module_code.localeCompare(b.module_code);
      }
      return 0;
    });

  const uniqueModules = [...new Set(sessions.map(s => s.module_code))];

  const getDetailLevelColor = (level) => {
    switch (level) {
      case 'concise':
        return 'bg-green-100 text-green-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'in-depth':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Sessions</h1>
          <p className="text-gray-600">Browse and manage your study sessions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load sessions</h3>
        <p className="text-gray-600 mb-4">Please try refreshing the page</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Sessions</h1>
        <p className="text-gray-600">Browse and manage your study sessions</p>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Module Filter */}
          <div className="md:w-48">
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="input-field"
            >
              <option value="">All Modules</option>
              {uniqueModules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="date">Sort by Date</option>
              <option value="module">Sort by Module</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Link
              key={session.session_id}
              to={`/session/${session.session_id}`}
              className="card hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {session.module_code}
                  </h3>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDetailLevelColor(session.detail_level)}`}>
                  {session.detail_level}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{session.chapters}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FolderIcon className="w-4 h-4" />
                  <span>View</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {sessions.length === 0 ? 'No sessions yet' : 'No sessions match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {sessions.length === 0 
              ? 'Start your first study session to see it here'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {sessions.length === 0 && (
            <Link
              to="/new"
              className="btn-primary inline-flex items-center"
            >
              <AcademicCapIcon className="w-4 h-4 mr-2" />
              Create Session
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{uniqueModules.length}</div>
              <div className="text-sm text-gray-600">Unique Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sessions.filter(s => s.detail_level === 'in-depth').length}
              </div>
              <div className="text-sm text-gray-600">In-depth Sessions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
export default SessionsList; 