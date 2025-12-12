import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, message, Divider, Select, Tag } from 'antd';
import { 
  TwitterOutlined, 
  FacebookOutlined, 
  LinkedinOutlined, 
  ShareAltOutlined,
  LinkOutlined,
  MailOutlined,
  CopyOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SocialPost {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'email';
  title: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
}

const SocialMediaIntegration: React.FC = () => {
  const [post, setPost] = useState<SocialPost>({
    platform: 'twitter',
    title: '',
    content: '',
    hashtags: [],
    imageUrl: ''
  });
  const [isSharing, setIsSharing] = useState(false);

  const platformConfigs = {
    twitter: {
      name: 'Twitter',
      icon: <TwitterOutlined style={{ color: '#1DA1F2' }} />,
      maxChars: 280,
      color: '#1DA1F2'
    },
    facebook: {
      name: 'Facebook',
      icon: <FacebookOutlined style={{ color: '#4267B2' }} />,
      maxChars: 63206,
      color: '#4267B2'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: <LinkedinOutlined style={{ color: '#0077B5' }} />,
      maxChars: 3000,
      color: '#0077B5'
    },
    email: {
      name: 'Email',
      icon: <MailOutlined style={{ color: '#EA4335' }} />,
      maxChars: 10000,
      color: '#EA4335'
    }
  };

  const currentPlatform = platformConfigs[post.platform];

  const handleShare = async () => {
    if (!post.content.trim()) {
      message.error('Please enter content to share');
      return;
    }

    setIsSharing(true);

    // Simulate sharing process
    setTimeout(() => {
      const shareUrl = generateShareUrl();
      
      if (post.platform === 'email') {
        // Open email client
        const subject = encodeURIComponent(post.title);
        const body = encodeURIComponent(post.content);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      } else {
        // Copy share link to clipboard
        navigator.clipboard.writeText(shareUrl);
        message.success(`Share link copied to clipboard! Paste it on ${currentPlatform.name}`);
      }

      setIsSharing(false);
    }, 1000);
  };

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const noteUrl = `${baseUrl}/notes`;
    
    switch (post.platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}&hashtags=${encodeURIComponent(post.hashtags.join(','))}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(noteUrl)}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(noteUrl)}`;
      default:
        return noteUrl;
    }
  };

  const getCharacterCount = () => {
    const totalChars = post.content.length + post.hashtags.join(' ').length;
    return totalChars;
  };

  const isOverLimit = () => {
    return getCharacterCount() > currentPlatform.maxChars;
  };

  const handleAddHashtag = (value: string) => {
    if (value && !post.hashtags.includes(value)) {
      setPost({ ...post, hashtags: [...post.hashtags, value] });
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setPost({ ...post, hashtags: post.hashtags.filter(tag => tag !== tagToRemove) });
  };

  const commonHashtags = ['NoteFusion', 'Productivity', 'StudyTips', 'AI', 'Learning', 'Notes'];

  return (
    <Card title="Social Media Integration" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>Select Platform:</Text>
          <div style={{ marginTop: 8, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(platformConfigs).map(([key, config]) => (
              <Button
                key={key}
                type={post.platform === key ? 'primary' : 'default'}
                icon={config.icon}
                onClick={() => setPost({ ...post, platform: key as keyof typeof platformConfigs })}
                style={{ 
                  borderColor: config.color,
                  color: post.platform === key ? 'white' : config.color
                }}
              >
                {config.name}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Text strong>Title (Optional):</Text>
          <Input
            placeholder="Enter a title for your post"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <Text strong>Content:</Text>
          <TextArea
            placeholder={`Write your ${currentPlatform.name} post...`}
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            rows={4}
            style={{ marginTop: 8 }}
            showCount
            maxLength={currentPlatform.maxChars}
          />
          <div style={{ 
            marginTop: 4, 
            fontSize: '12px', 
            color: isOverLimit() ? '#f5222d' : '#8c8c8c' 
          }}>
            Character count: {getCharacterCount()} / {currentPlatform.maxChars}
            {isOverLimit() && ' (Over limit!)'}
          </div>
        </div>

        <div>
          <Text strong>Hashtags:</Text>
          <div style={{ marginTop: 8 }}>
            <Select<string>
              placeholder="Add hashtags"
              style={{ width: '100%', marginBottom: 8 }}
              onSelect={(value: string) => handleAddHashtag(value)}
              value={undefined}
            >
              {commonHashtags.filter(tag => !post.hashtags.includes(tag)).map(tag => (
                <Select.Option key={tag} value={tag}>
                  #{tag}
                </Select.Option>
              ))}
            </Select>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {post.hashtags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveHashtag(tag)}
                  color={currentPlatform.color}
                >
                  #{tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Text strong>Image URL (Optional):</Text>
          <Input
            placeholder="Add image URL for your post"
            value={post.imageUrl}
            onChange={(e) => setPost({ ...post, imageUrl: e.target.value })}
            style={{ marginTop: 8 }}
          />
        </div>

        <Divider />

        <Space>
          <Button 
            type="primary" 
            icon={<ShareAltOutlined />}
            onClick={handleShare}
            loading={isSharing}
            disabled={isOverLimit() || !post.content.trim()}
            style={{ backgroundColor: currentPlatform.color, borderColor: currentPlatform.color }}
          >
            {isSharing ? 'Sharing...' : `Share on ${currentPlatform.name}`}
          </Button>
          
          <Button 
            icon={<CopyOutlined />}
            onClick={() => {
              const shareText = `${post.title}\n\n${post.content}\n\n${post.hashtags.map(tag => `#${tag}`).join(' ')}`;
              navigator.clipboard.writeText(shareText);
              message.success('Content copied to clipboard!');
            }}
          >
            Copy Content
          </Button>
        </Space>

        <div style={{ 
          padding: '16px', 
          background: '#f6f8fa', 
          borderRadius: '6px'
        }}>
          <Title level={5}>Preview:</Title>
          <div style={{ 
            padding: '12px', 
            border: `1px solid ${currentPlatform.color}20`,
            borderRadius: '8px',
            background: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {currentPlatform.icon}
              <Text strong>{currentPlatform.name}</Text>
            </div>
            {post.title && (
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                {post.title}
              </Text>
            )}
            <Paragraph style={{ marginBottom: '8px' }}>
              {post.content || 'Your content will appear here...'}
            </Paragraph>
            {post.hashtags.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                {post.hashtags.map(tag => (
                  <Tag key={tag} color={currentPlatform.color} style={{ marginRight: '4px' }}>
                    #{tag}
                  </Tag>
                ))}
              </div>
            )}
            {post.imageUrl && (
              <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                <LinkOutlined /> {post.imageUrl}
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          padding: '16px', 
          background: '#f6f8fa', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <Text type="secondary">
            <ShareAltOutlined style={{ marginRight: '4px' }} />
            Share your notes and achievements on social media to inspire others and build your learning community.
            Each platform has different character limits and formatting options.
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default SocialMediaIntegration;
