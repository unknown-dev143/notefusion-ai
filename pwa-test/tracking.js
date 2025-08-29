// Track tool usage
const trackToolUsage = (toolName) => {
    try {
        // Get existing usage data or initialize if not exists
        const usage = JSON.parse(localStorage.getItem('toolUsage') || '{}');
        
        // Update usage count for the tool
        usage[toolName] = (usage[toolName] || 0) + 1;
        
        // Save back to localStorage
        localStorage.setItem('toolUsage', JSON.stringify(usage));
        
        // In a real app, you would send this to your backend
        console.log(`[Tracking] Tool used: ${toolName}, Total uses: ${usage[toolName]}`);
        
        // Also track the session activity
        trackSessionActivity(toolName, 'used');
        
        return true;
    } catch (error) {
        console.error('Error tracking tool usage:', error);
        return false;
    }
};

// Track user sessions
const trackSession = () => {
    try {
        const sessionId = 'session-' + Date.now();
        const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
        
        // Add new session
        const newSession = {
            id: sessionId,
            startTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            lastActive: new Date().toISOString(),
            pageViews: 1
        };
        
        sessions.push(newSession);
        localStorage.setItem('userSessions', JSON.stringify(sessions));
        localStorage.setItem('currentSessionId', sessionId);
        
        // Update active users count
        updateActiveUsers();
        
        return sessionId;
    } catch (error) {
        console.error('Error tracking session:', error);
        return null;
    }
};

// Track page views and activity
const trackPageView = (pageName) => {
    try {
        // Update session activity
        const sessionId = localStorage.getItem('currentSessionId') || trackSession();
        const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
        const session = sessions.find(s => s.id === sessionId);
        
        if (session) {
            session.lastActive = new Date().toISOString();
            session.pageViews = (session.pageViews || 0) + 1;
            session.currentPage = pageName;
            localStorage.setItem('userSessions', JSON.stringify(sessions));
        }
        
        // Track in recent activity
        trackSessionActivity(pageName, 'viewed');
        
        return true;
    } catch (error) {
        console.error('Error tracking page view:', error);
        return false;
    }
};

// Track specific session activities
const trackSessionActivity = (item, action) => {
    try {
        const activities = JSON.parse(localStorage.getItem('sessionActivities') || '[]');
        const sessionId = localStorage.getItem('currentSessionId');
        
        activities.push({
            sessionId,
            timestamp: new Date().toISOString(),
            item,
            action,
            userAgent: navigator.userAgent
        });
        
        // Keep only the last 100 activities
        if (activities.length > 100) {
            activities.shift();
        }
        
        localStorage.setItem('sessionActivities', JSON.stringify(activities));
        return true;
    } catch (error) {
        console.error('Error tracking session activity:', error);
        return false;
    }
};

// Update active users count
const updateActiveUsers = () => {
    try {
        const now = new Date();
        const activeThreshold = 30 * 60 * 1000; // 30 minutes
        const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
        
        // Filter active sessions (active in the last 30 minutes)
        const activeSessions = sessions.filter(session => {
            const lastActive = new Date(session.lastActive || session.startTime);
            return (now - lastActive) < activeThreshold;
        });
        
        localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
        return activeSessions.length;
    } catch (error) {
        console.error('Error updating active users:', error);
        return 0;
    }
};

// Get usage statistics
const getUsageStats = () => {
    try {
        return {
            toolUsage: JSON.parse(localStorage.getItem('toolUsage') || '{}'),
            sessions: JSON.parse(localStorage.getItem('userSessions') || '[]'),
            activities: JSON.parse(localStorage.getItem('sessionActivities') || '[]'),
            activeUsers: updateActiveUsers()
        };
    } catch (error) {
        console.error('Error getting usage stats:', error);
        return {
            toolUsage: {},
            sessions: [],
            activities: [],
            activeUsers: 0
        };
    }
};

// Initialize tracking
document.addEventListener('DOMContentLoaded', () => {
    // Start tracking session if not already started
    if (!localStorage.getItem('currentSessionId')) {
        trackSession();
    }
    
    // Track page view
    const pageName = document.title || window.location.pathname;
    trackPageView(pageName);
    
    // Set up automatic session updates
    setInterval(() => {
        updateActiveUsers();
    }, 5 * 60 * 1000); // Update every 5 minutes
});

// Export functions for use in other scripts
window.tracking = {
    trackToolUsage,
    trackSession,
    trackPageView,
    trackSessionActivity,
    getUsageStats,
    updateActiveUsers
};
