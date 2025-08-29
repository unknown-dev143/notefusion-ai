import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import '../styles/ActivityFeed.css';

interface Activity {
  id: string;
  type: 'note_created' | 'note_updated' | 'file_uploaded' | 'ai_generated';
  title: string;
  timestamp: Date;
  user: string;
  metadata?: Record<string, any>;
}

const activityIcons = {
  note_created: '📝',
  note_updated: '✏️',
  file_uploaded: '📎',
  ai_generated: '🤖',
};

const activityMessages = {
  note_created: 'created a new note',
  note_updated: 'updated a note',
  file_uploaded: 'uploaded a file',
  ai_generated: 'generated content with AI',
};

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  maxItems = 5 
}) => {
  const recentActivities = activities.slice(0, maxItems);

  return (
    <div className="activity-feed">
      <h3 className="feed-title">Recent Activity</h3>
      <div className="activities-list">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <span className="activity-icon">
                {activityIcons[activity.type]}
              </span>
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-time">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="activity-message">
                  {activityMessages[activity.type]}: "{activity.title}"
                </p>
                {activity.metadata?.aiModel && (
                  <span className="ai-badge">
                    {activity.metadata.aiModel}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-activities">No recent activities</p>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
