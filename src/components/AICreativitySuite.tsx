import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Select, Tabs, List, Tag, Slider, Row, Col } from 'antd';
import { 
  BulbOutlined,
  ThunderboltOutlined,
  EditOutlined,
  StarOutlined,
  ToolOutlined,
  BookOutlined,
  MessageOutlined,
  CopyOutlined,
  DownloadOutlined,
  SoundOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  timestamp: string;
  rating: number;
  developed: boolean;
}

interface StoryElement {
  id: string;
  type: 'character' | 'setting' | 'plot' | 'dialogue' | 'theme';
  content: string;
  details?: any;
}

interface DesignSuggestion {
  id: string;
  type: 'layout' | 'color' | 'typography' | 'component';
  suggestion: string;
  rationale: string;
  confidence: number;
}

const AICreativitySuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState('brainstorm');
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [creativityLevel, setCreativityLevel] = useState(0.7);
  const [storyElements, setStoryElements] = useState<StoryElement[]>([]);
  const [storyPrompt, setStoryPrompt] = useState('');
  const [storyGenre, setStoryGenre] = useState('fantasy');
  const [designSuggestions, setDesignSuggestions] = useState<DesignSuggestion[]>([]);
  const [designType, setDesignType] = useState('layout');
  const [musicMood, setMusicMood] = useState('upbeat');
  const [musicTempo, setMusicTempo] = useState(120);
  const [generatedMusic, setGeneratedMusic] = useState('');

  const storyGenres = ['fantasy', 'sci-fi', 'romance', 'mystery', 'thriller', 'comedy', 'drama'];
  
  const designTypes = ['layout', 'color', 'typography', 'component'];

  const musicMoods = ['upbeat', 'calm', 'dramatic', 'energetic', 'melancholic', 'inspiring'];

  const generateIdeas = () => {
    setIsGenerating(true);
    // Mock AI idea generation
    setTimeout(() => {
      const newIdeas: Idea[] = [
        {
          id: Date.now().toString() + '1',
          title: 'AI-Powered Study Assistant',
          description: 'Create an AI assistant that adapts to individual learning styles and provides personalized study recommendations.',
          category: 'Technology',
          tags: ['AI', 'Education', 'Personalization'],
          timestamp: new Date().toISOString(),
          rating: 4.5,
          developed: false
        },
        {
          id: Date.now().toString() + '2',
          title: 'Smart Home Energy Monitor',
          description: 'Develop a system that tracks and optimizes home energy usage with real-time recommendations.',
          category: 'Environmental',
          tags: ['IoT', 'Sustainability', 'Smart Home'],
          timestamp: new Date().toISOString(),
          rating: 4.2,
          developed: false
        },
        {
          id: Date.now().toString() + '3',
          title: 'Virtual Reality Collaboration Platform',
          description: 'Build a VR platform for remote teams to collaborate in immersive 3D environments.',
          category: 'Business',
          tags: ['VR', 'Collaboration', 'Remote Work'],
          timestamp: new Date().toISOString(),
          rating: 4.7,
          developed: false
        }
      ];
      setIdeas([...newIdeas, ...ideas]);
      setIsGenerating(false);
    }, 2000);
  };

  const generateStoryElements = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const elements: StoryElement[] = [
        {
          id: '1',
          type: 'character',
          content: 'Elena, a brilliant but reclusive quantum physicist who discovers a way to communicate with parallel universes',
          details: { age: 32, personality: 'INTJ', motivation: 'Seeking truth' }
        },
        {
          id: '2',
          type: 'setting',
          content: 'A hidden laboratory beneath the Swiss Alps, where quantum experiments bend reality',
          details: { location: 'Switzerland', time: 'Near future', atmosphere: 'Mysterious' }
        },
        {
          id: '3',
          type: 'plot',
          content: 'Elena must prevent a catastrophic merge of universes while being hunted by a shadow organization',
          details: { conflict: 'Man vs Nature', stakes: 'Existential' }
        }
      ];
      setStoryElements(elements);
      setIsGenerating(false);
    }, 2000);
  };

  const generateDesignSuggestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const suggestions: DesignSuggestion[] = [
        {
          id: '1',
          type: 'layout',
          suggestion: 'Use a golden ratio-based grid for better visual hierarchy',
          rationale: 'Golden ratio creates naturally pleasing proportions that guide user attention',
          confidence: 0.85
        },
        {
          id: '2',
          type: 'color',
          suggestion: 'Implement a complementary color scheme with blue and orange accents',
          rationale: 'Blue conveys trust and professionalism, orange adds energy and calls to action',
          confidence: 0.78
        },
        {
          id: '3',
          type: 'typography',
          suggestion: 'Use sans-serif fonts for headings and serif for body text',
          rationale: 'This combination improves readability and creates clear visual hierarchy',
          confidence: 0.92
        }
      ];
      setDesignSuggestions(suggestions);
      setIsGenerating(false);
    }, 2000);
  };

  const generateMusic = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const music = `
Generated Music: ${musicMood} Theme
Tempo: ${musicTempo} BPM
Key: C Major
Duration: 3:45

[Verse 1]
Piano melody with gentle strings
${musicMood === 'upbeat' ? 'Major chord progression: C - G - Am - F' :
  musicMood === 'calm' ? 'Minor chord progression: Am - F - C - G' :
  musicMood === 'dramatic' ? 'Diminished chords with tension' : 'Simple melodic pattern'}

[Chorus]
Full orchestration with percussion
${musicMood === 'energetic' ? 'Driving rhythm with brass section' :
  musicMood === 'inspiring' ? 'Uplifting chord progressions' : 'Harmonious blend'}

[Bridge]
${musicMood === 'melancholic' ? 'Minor key transition with solo piano' : 'Modulation to relative major'}

[Outro]
Fade out with sustained strings
      `;
      setGeneratedMusic(music.trim());
      setIsGenerating(false);
    }, 2000);
  };

  const developIdea = (idea: Idea) => {
    const updatedIdeas = ideas.map(i => 
      i.id === idea.id ? { ...i, developed: true } : i
    );
    setIdeas(updatedIdeas);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'blue',
      'Business': 'green',
      'Creative': 'purple',
      'Personal': 'orange',
      'Academic': 'red',
      'Social': 'cyan',
      'Environmental': 'lime'
    };
    return colors[category] || 'default';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <BulbOutlined />
          AI Creativity Suite
        </Space>
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Brainstorming" key="brainstorm">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Topic for Brainstorming:</Text>
                <Input
                  placeholder="Enter a topic to generate ideas..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <div>
                <Text strong>Creativity Level:</Text>
                <Slider
                  value={creativityLevel}
                  onChange={setCreativityLevel}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={{ 0: 'Practical', 1: 'Highly Creative' }}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={generateIdeas}
                loading={isGenerating}
                disabled={!topic}
                block
              >
                Generate Ideas
              </Button>

              {ideas.length > 0 && (
                <List
                  dataSource={ideas}
                  renderItem={(idea) => (
                    <List.Item>
                      <Card size="small" style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text strong>{idea.title}</Text>
                            <Tag color={getCategoryColor(idea.category)} style={{ marginLeft: '8px' }}>
                              {idea.category}
                            </Tag>
                            <StarOutlined style={{ marginLeft: '8px', color: '#faad14' }} />
                            <Text>{idea.rating}</Text>
                          </div>
                          
                          <Text type="secondary">{idea.description}</Text>
                          
                          <Space wrap>
                            {idea.tags.map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </Space>

                          <Space>
                            <Button
                              size="small"
                              type={idea.developed ? 'default' : 'primary'}
                              icon={<ToolOutlined />}
                              onClick={() => developIdea(idea)}
                            >
                              {idea.developed ? 'In Development' : 'Develop'}
                            </Button>
                            <Button size="small" icon={<CopyOutlined />}>
                              Copy
                            </Button>
                            <Button size="small" icon={<DownloadOutlined />}>
                              Export
                            </Button>
                          </Space>
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Creative Writing" key="writing">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Story Generator" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Story Prompt:</Text>
                    <TextArea
                      placeholder="Enter your story prompt..."
                      value={storyPrompt}
                      onChange={(e) => setStoryPrompt(e.target.value)}
                      rows={4}
                      style={{ marginTop: '8px' }}
                    />
                  </div>

                  <div>
                    <Text strong>Genre:</Text>
                    <Select
                      value={storyGenre}
                      onChange={setStoryGenre}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      {storyGenres.map(genre => (
                        <Option key={genre} value={genre}>
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={generateStoryElements}
                    loading={isGenerating}
                    disabled={!storyPrompt}
                    block
                  >
                    Generate Story Elements
                  </Button>

                  {storyElements.length > 0 && (
                    <Button
                      icon={<BookOutlined />}
                      onClick={() => {}}
                      block
                    >
                      Generate Full Story
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Story Elements" size="small">
                {storyElements.length > 0 ? (
                  <List
                    dataSource={storyElements}
                    renderItem={(element) => (
                      <List.Item>
                        <Card size="small" style={{ width: '100%' }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                              <Text strong>{element.type.charAt(0).toUpperCase() + element.type.slice(1)}:</Text>
                              <Tag color="blue" style={{ marginLeft: '8px' }}>
                                {element.type}
                              </Tag>
                            </div>
                            <Text>{element.content}</Text>
                          </Space>
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <EditOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary">Story elements will appear here</Text>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Design Assistant" key="design">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Design Type:</Text>
                <Select
                  value={designType}
                  onChange={setDesignType}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {designTypes.map(type => (
                    <Option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Option>
                  ))}
                </Select>
              </div>

              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={generateDesignSuggestions}
                loading={isGenerating}
                block
              >
                Generate Design Suggestions
              </Button>

              {designSuggestions.length > 0 && (
                <List
                  dataSource={designSuggestions}
                  renderItem={(suggestion) => (
                    <List.Item>
                      <Card size="small" style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text strong>{suggestion.type}:</Text>
                            <Tag color="purple" style={{ marginLeft: '8px' }}>
                              {suggestion.type}
                            </Tag>
                            <Text style={{ marginLeft: '8px' }}>
                              Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                            </Text>
                          </div>
                          
                          <Text>{suggestion.suggestion}</Text>
                          
                          <div>
                            <Text strong>Rationale:</Text>
                            <Text type="secondary">{suggestion.rationale}</Text>
                          </div>
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Music Generator" key="music">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Mood:</Text>
                <Select
                  value={musicMood}
                  onChange={setMusicMood}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {musicMoods.map(mood => (
                    <Option key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>Tempo (BPM):</Text>
                <Slider
                  value={musicTempo}
                  onChange={setMusicTempo}
                  min={60}
                  max={180}
                  marks={{ 60: 'Slow', 120: 'Medium', 180: 'Fast' }}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <Button
                type="primary"
                icon={<SoundOutlined />}
                onClick={generateMusic}
                loading={isGenerating}
                block
              >
                Generate Music
              </Button>

              {generatedMusic && (
                <div>
                  <Title level={4}>Generated Music</Title>
                  <Paragraph style={{ whiteSpace: 'pre-line', backgroundColor: '#f6ffed', padding: '16px', borderRadius: '8px' }}>
                    {generatedMusic}
                  </Paragraph>
                  <Space>
                    <Button icon={<DownloadOutlined />}>
                      Download MIDI
                    </Button>
                    <Button icon={<MessageOutlined />}>
                      Add to Project
                    </Button>
                  </Space>
                </div>
              )}
            </Space>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AICreativitySuite;
