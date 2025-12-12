import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Button, Space, Row, Col, Input, message, Avatar, List, Tag } from 'antd';
import { 
  MessageOutlined, 
  PlayCircleOutlined,
  UserOutlined,
  SendOutlined,
  LikeOutlined,
  DislikeOutlined,
  FlagOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: number;
  likes: number;
  dislikes: number;
  replies: Comment[];
  videoTimestamp?: number;
  isPinned?: boolean;
}


const VideoComments: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [videoStats, setVideoStats] = useState({
    totalComments: 0,
    likes: 0,
    dislikes: 0,
    shares: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Initialize with sample comments
    const sampleComments: Comment[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'John Doe',
        content: 'Great tutorial! Really helped me understand the concepts.',
        timestamp: Date.now() - 3600000,
        likes: 12,
        dislikes: 1,
        replies: [
          {
            id: '1-1',
            userId: 'user2',
            username: 'Jane Smith',
            content: 'I agree! The explanation was very clear.',
            timestamp: Date.now() - 3000000,
            likes: 5,
            dislikes: 0,
            replies: []
          }
        ],
        videoTimestamp: 120,
        isPinned: true
      },
      {
        id: '2',
        userId: 'user3',
        username: 'Bob Wilson',
        content: 'Can you make a video about advanced React hooks?',
        timestamp: Date.now() - 1800000,
        likes: 8,
        dislikes: 0,
        replies: [],
        videoTimestamp: 300
      }
    ];

    setComments(sampleComments);
    setVideoStats({
      totalComments: sampleComments.length + sampleComments.reduce((acc, c) => acc + c.replies.length, 0),
      likes: 156,
      dislikes: 3,
      shares: 42
    });
  }, []);

  const handleVideoUpload = (file: File) => {
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      message.success('Video uploaded successfully!');
    } else {
      message.error('Please upload a valid video file');
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const addComment = () => {
    if (!newComment.trim()) {
      message.error('Please enter a comment');
      return;
    }

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'current-user',
      username: 'You',
      content: newComment,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      replies: [],
      videoTimestamp: selectedTimestamp || undefined
    };

    if (replyingTo) {
      setComments(prev => prev.map(c => 
        c.id === replyingTo 
          ? { ...c, replies: [...c.replies, comment] }
          : c
      ));
      setReplyingTo(null);
      setReplyContent('');
    } else {
      setComments(prev => [comment, ...prev]);
    }

    setNewComment('');
    setSelectedTimestamp(null);
    setVideoStats(prev => ({
      ...prev,
      totalComments: prev.totalComments + 1
    }));
    message.success('Comment added successfully!');
  };

  const addReply = (commentId: string) => {
    if (!replyContent.trim()) {
      message.error('Please enter a reply');
      return;
    }

    const reply: Comment = {
      id: `reply-${Date.now()}`,
      userId: 'current-user',
      username: 'You',
      content: replyContent,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, replies: [...c.replies, reply] }
        : c
    ));

    setReplyingTo(null);
    setReplyContent('');
    setVideoStats(prev => ({
      ...prev,
      totalComments: prev.totalComments + 1
    }));
    message.success('Reply added successfully!');
  };

  const likeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(c => 
        c.id === parentId 
          ? {
              ...c,
              replies: c.replies.map(r => 
                r.id === commentId 
                  ? { ...r, likes: r.likes + 1 }
                  : r
              )
            }
          : c
      ));
    } else {
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, likes: c.likes + 1 }
          : c
      ));
    }
  };

  const dislikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(c => 
        c.id === parentId 
          ? {
              ...c,
              replies: c.replies.map(r => 
                r.id === commentId 
                  ? { ...r, dislikes: r.dislikes + 1 }
                  : r
              )
            }
          : c
      ));
    } else {
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, dislikes: c.dislikes + 1 }
          : c
      ));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const jumpToTimestamp = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false, parentId?: string) => (
    <div key={comment.id} style={{ marginBottom: 16 }}>
      <Row gutter={[12, 8]} align="top">
        <Col>
          <Avatar icon={<UserOutlined />} src={comment.avatar} />
        </Col>
        <Col flex="auto">
          <div>
            <Space>
              <Text strong>{comment.username}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatTimestamp(comment.timestamp)}
              </Text>
              {comment.isPinned && <Tag color="red">Pinned</Tag>}
            </Space>
            
            {comment.videoTimestamp && (
              <div style={{ marginTop: 4 }}>
                <Button
                  size="small"
                  type="link"
                  icon={<PlayCircleOutlined />}
                  onClick={() => jumpToTimestamp(comment.videoTimestamp!)}
                >
                  {formatTime(comment.videoTimestamp)}
                </Button>
              </div>
            )}
            
            <div style={{ marginTop: 8 }}>
              <Text>{comment.content}</Text>
            </div>
            
            <div style={{ marginTop: 8 }}>
              <Space>
                <Button
                  size="small"
                  type="text"
                  icon={<LikeOutlined />}
                  onClick={() => likeComment(comment.id, isReply, parentId)}
                >
                  {comment.likes}
                </Button>
                <Button
                  size="small"
                  type="text"
                  icon={<DislikeOutlined />}
                  onClick={() => dislikeComment(comment.id, isReply, parentId)}
                >
                  {comment.dislikes}
                </Button>
                {!isReply && (
                  <Button
                    size="small"
                    type="text"
                    icon={<MessageOutlined />}
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    Reply
                  </Button>
                )}
                <Button
                  size="small"
                  type="text"
                  icon={<FlagOutlined />}
                >
                  Report
                </Button>
              </Space>
            </div>
          </div>
        </Col>
      </Row>
      
      {replyingTo === comment.id && (
        <div style={{ marginLeft: 48, marginTop: 12 }}>
          <TextArea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            style={{ marginBottom: 8 }}
          />
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={() => addReply(comment.id)}
            >
              Reply
            </Button>
            <Button
              size="small"
              onClick={() => {
                setReplyingTo(null);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </Space>
        </div>
      )}
      
      {!isReply && comment.replies.length > 0 && (
        <div style={{ marginLeft: 48, marginTop: 12 }}>
          {comment.replies.map(reply => renderComment(reply, true, comment.id))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Video Comments</Title>
            <Text type="secondary">Engage with your audience through comments</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{videoStats.totalComments} comments</Tag>
              <Tag color="green">{videoStats.likes} likes</Tag>
              <Tag color="orange">{videoStats.shares} shares</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Video Player" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file);
                  }}
                  style={{ display: 'none' }}
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button icon={<PlayCircleOutlined />}>
                    Upload Video
                  </Button>
                </label>
              </div>

              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  style={{ width: '100%' }}
                  onTimeUpdate={handleVideoTimeUpdate}
                />
              )}

              {videoUrl && (
                <div>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      setSelectedTimestamp(currentTime);
                      message.info(`Timestamp ${formatTime(currentTime)} added to new comment`);
                    }}
                  >
                    Add Timestamp to Comment
                  </Button>
                  {selectedTimestamp !== null && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {formatTime(selectedTimestamp)}
                    </Tag>
                  )}
                </div>
              )}
            </Space>
          </Card>

          <Card title="Add Comment" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={addComment}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Comments" size="small">
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  <MessageOutlined style={{ fontSize: 48 }} />
                  <div style={{ marginTop: 16 }}>No comments yet. Be the first to comment!</div>
                </div>
              ) : (
                <List
                  dataSource={comments}
                  renderItem={(comment: Comment) => renderComment(comment)}
                />
              )}
            </div>
          </Card>

          <Card title="Video Statistics" size="small" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <div>
                  <Text strong>Total Comments</Text>
                  <div style={{ fontSize: 24, color: '#1890ff' }}>
                    {videoStats.totalComments}
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div>
                  <Text strong>Engagement Rate</Text>
                  <div style={{ fontSize: 24, color: '#52c41a' }}>
                    {Math.round(((videoStats.likes + videoStats.totalComments) / (videoStats.likes + videoStats.dislikes + videoStats.totalComments)) * 100)}%
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div>
                  <Text strong>Like Ratio</Text>
                  <div style={{ fontSize: 24, color: '#fa8c16' }}>
                    {Math.round((videoStats.likes / (videoStats.likes + videoStats.dislikes)) * 100)}%
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div>
                  <Text strong>Shares</Text>
                  <div style={{ fontSize: 24, color: '#722ed1' }}>
                    {videoStats.shares}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VideoComments;
