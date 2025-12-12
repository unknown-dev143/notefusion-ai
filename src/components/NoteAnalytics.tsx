import React from 'react';
import { Card, Typography, Statistic, Row, Col, Progress, Space, Tag } from 'antd';
import { 
  FileTextOutlined, 
  StarOutlined, 
  EditOutlined, 
  CalendarOutlined,
  TrophyOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

const { Text } = Typography;

interface NoteAnalyticsProps {
  notes: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isFavorite?: boolean;
    isArchived?: boolean;
    category?: string;
    tags?: string[];
  }>;
}

const NoteAnalytics: React.FC<NoteAnalyticsProps> = ({ notes }) => {
  const totalNotes = notes.length;
  const favoriteNotes = notes.filter(note => note.isFavorite).length;
  const archivedNotes = notes.filter(note => note.isArchived).length;
  const activeNotes = totalNotes - archivedNotes;

  // Calculate total words
  const totalWords = notes.reduce((sum, note) => {
    return sum + note.content.split(/\s+/).filter(word => word.length > 0).length;
  }, 0);

  // Calculate average words per note
  const avgWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

  // Get most recent note
  const mostRecentNote = notes.reduce((latest, note) => {
    return !latest || new Date(note.updatedAt) > new Date(latest.updatedAt) ? note : latest;
  }, null as any);

  // Get note categories distribution
  const categories = notes.reduce((acc, note) => {
    const cat = note.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get top categories
  const topCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate notes created in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const notesLast7Days = notes.filter(note => 
    new Date(note.createdAt) >= sevenDaysAgo
  ).length;

  // Calculate notes updated in last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const notesLast24Hours = notes.filter(note => 
    new Date(note.updatedAt) >= twentyFourHoursAgo
  ).length;

  return (
    <Card title="Note Analytics" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Overview Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Total Notes"
              value={totalNotes}
              prefix={<FileTextOutlined />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Favorites"
              value={favoriteNotes}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Active"
              value={activeNotes}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Archived"
              value={archivedNotes}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Col>
        </Row>

        {/* Writing Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Statistic
              title="Total Words"
              value={totalWords}
              prefix={<EditOutlined />}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Statistic
              title="Avg Words/Note"
              value={avgWordsPerNote}
              prefix={<TrophyOutlined />}
            />
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Statistic
              title="Notes (Last 7 Days)"
              value={notesLast7Days}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: notesLast7Days > 0 ? '#52c41a' : '#8c8c8c' }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Statistic
              title="Updated (Last 24h)"
              value={notesLast24Hours}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: notesLast24Hours > 0 ? '#52c41a' : '#8c8c8c' }}
            />
          </Col>
        </Row>

        {/* Categories Distribution */}
        <div>
          <Text strong style={{ marginBottom: 16, display: 'block' }}>Categories Distribution</Text>
          {topCategories.map(([category, count]) => (
            <div key={category} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text>{category}</Text>
                <Text>{count} notes</Text>
              </div>
              <Progress
                percent={Math.round((count / totalNotes) * 100)}
                size="small"
                showInfo={false}
              />
            </div>
          ))}
        </div>

        {/* Most Recent Note */}
        {mostRecentNote && (
          <div>
            <Text strong style={{ marginBottom: 8, display: 'block' }}>Most Recent Note</Text>
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>{mostRecentNote.title}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Updated: {new Date(mostRecentNote.updatedAt).toLocaleString()}
                </Text>
                {mostRecentNote.category && (
                  <Tag color="blue">{mostRecentNote.category}</Tag>
                )}
                <Text ellipsis style={{ fontSize: '12px' }}>
                  {mostRecentNote.content.substring(0, 100)}...
                </Text>
              </Space>
            </Card>
          </div>
        )}

        {/* Activity Summary */}
        <div style={{ padding: '12px', background: '#f6f8fa', borderRadius: '6px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <TrophyOutlined style={{ marginRight: '4px' }} />
            {notesLast7Days > 5 ? 'Great productivity! Keep it up!' : 
             notesLast7Days > 0 ? 'Good progress! Try to write more consistently.' :
             'Start writing! Create your first note to get started.'}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default NoteAnalytics;
