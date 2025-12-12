import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Input, Select, Slider, message, Progress, Switch, Tag } from 'antd';
import { DownloadOutlined, RobotOutlined, FontSizeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface VideoGenerationOptions {
  prompt: string;
  style: 'realistic' | 'animated' | 'cartoon' | 'cinematic' | 'documentary' | 'artistic';
  duration: number; // in seconds
  quality: 'low' | 'medium' | 'high' | 'ultra';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  addSubtitles: boolean;
  subtitleText: string;
  subtitlePosition: 'top' | 'bottom' | 'middle';
  subtitleStyle: 'simple' | 'bold' | 'elegant' | 'modern';
  subtitleTiming: 'auto' | 'manual';
  manualStartTime: number;
  manualEndTime: number;
}

interface GeneratedVideo {
  url: string;
  prompt: string;
  duration: number;
  resolution: string;
  format: string;
  generatedAt: string;
  subtitles?: {
    enabled: boolean;
    text: string;
    position: string;
    style: string;
  };
}

const VideoGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [options, setOptions] = useState<VideoGenerationOptions>({
    prompt: '',
    style: 'realistic',
    duration: 10,
    quality: 'medium',
    aspectRatio: '16:9',
    addSubtitles: false,
    subtitleText: '',
    subtitlePosition: 'bottom',
    subtitleStyle: 'simple',
    subtitleTiming: 'auto',
    manualStartTime: 0,
    manualEndTime: 10
  });
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>(JSON.parse(localStorage.getItem('generatedVideos') || '[]'));

  useEffect(() => {
    localStorage.setItem('generatedVideos', JSON.stringify(generatedVideos));
  }, [generatedVideos]);

  const generateVideo = async () => {
    if (!options.prompt.trim()) {
      message.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate video generation with progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    // Simulate API call for video generation
    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Generate video based on prompt (simulated)
      const videoType = options.prompt.toLowerCase().includes('tutorial') ? 'tutorial' : 
                       options.prompt.toLowerCase().includes('presentation') ? 'presentation' : 'general';
      
      const mockVideoUrls = {
        tutorial: 'https://www.w3schools.com/html/mov_bbb.mp4',
        presentation: 'https://www.w3schools.com/html/movie.mp4',
        general: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
      };
      
      const generatedVideo: GeneratedVideo = {
        url: mockVideoUrls[videoType] || mockVideoUrls.general,
        prompt: options.prompt,
        duration: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
        resolution: '720p',
        format: 'mp4',
        generatedAt: new Date().toISOString(),
        subtitles: options.addSubtitles ? {
          enabled: true,
          text: options.subtitleText,
          position: options.subtitlePosition,
          style: options.subtitleStyle
        } : undefined
      };
      
      setGeneratedVideos(prev => [...prev, generatedVideo]);
      setIsGenerating(false);
      message.success('Video generated successfully!');
    }, 5000);
  };

  const downloadVideo = (video: GeneratedVideo, index: number) => {
    const link = document.createElement('a');
    link.href = video.url;
    link.download = `generated_video_${index + 1}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Video download started!');
  };

  const generateVTTSubtitles = (video: GeneratedVideo) => {
    if (!video.subtitles?.enabled || !video.subtitles.text) return '';
    
    const startTime = '00:00:00.000';
    const endTime = '00:00:10.000';
    
    return `WEBVTT\n\n${startTime} --> ${endTime}\n${video.subtitles.text}`;
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>AI Video Generator</Title>
      
      <Card title="Video Generation Settings" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Video Description</Text>
            <TextArea
              value={options.prompt}
              onChange={(e) => setOptions(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Describe the video you want to generate..."
              rows={3}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text strong>Style</Text>
            <Select
              value={options.style}
              onChange={(value) => setOptions(prev => ({ ...prev, style: value }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Select.Option value="realistic">Realistic</Select.Option>
              <Select.Option value="animated">Animated</Select.Option>
              <Select.Option value="cartoon">Cartoon</Select.Option>
              <Select.Option value="cinematic">Cinematic</Select.Option>
              <Select.Option value="documentary">Documentary</Select.Option>
              <Select.Option value="artistic">Artistic</Select.Option>
            </Select>
          </div>

          <div>
            <Text strong>
              <FontSizeOutlined /> Subtitle Options:
            </Text>
            <div style={{ marginTop: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Switch
                    checked={options.addSubtitles}
                    onChange={(checked) => setOptions(prev => ({ ...prev, addSubtitles: checked }))}
                    checkedChildren="Add Subtitles"
                    unCheckedChildren="No Subtitles"
                  />
                </div>

                {options.addSubtitles && (
                  <>
                    <div>
                      <Text>Subtitle Text:</Text>
                      <TextArea
                        value={options.subtitleText}
                        onChange={(e) => setOptions(prev => ({ ...prev, subtitleText: e.target.value }))}
                        placeholder="Enter subtitle text..."
                        rows={2}
                        style={{ marginTop: 4 }}
                      />
                    </div>

                    <div>
                      <Text>Position:</Text>
                      <Select
                        value={options.subtitlePosition}
                        onChange={(value) => setOptions(prev => ({ ...prev, subtitlePosition: value }))}
                        style={{ width: '100%', marginTop: 4 }}
                      >
                        <Select.Option value="top">Top</Select.Option>
                        <Select.Option value="middle">Middle</Select.Option>
                        <Select.Option value="bottom">Bottom</Select.Option>
                      </Select>
                    </div>

                    <div>
                      <Text>Style:</Text>
                      <Select
                        value={options.subtitleStyle}
                        onChange={(value) => setOptions(prev => ({ ...prev, subtitleStyle: value }))}
                        style={{ width: '100%', marginTop: 4 }}
                      >
                        <Select.Option value="simple">Simple</Select.Option>
                        <Select.Option value="bold">Bold</Select.Option>
                        <Select.Option value="elegant">Elegant</Select.Option>
                        <Select.Option value="modern">Modern</Select.Option>
                      </Select>
                    </div>

                    <div>
                      <Text>Timing:</Text>
                      <Select
                        value={options.subtitleTiming}
                        onChange={(value) => setOptions(prev => ({ ...prev, subtitleTiming: value }))}
                        style={{ width: '100%', marginTop: 4 }}
                      >
                        <Select.Option value="auto">Auto (Full Duration)</Select.Option>
                        <Select.Option value="manual">Manual Timing</Select.Option>
                      </Select>
                    </div>

                    {options.subtitleTiming === 'manual' && (
                      <div>
                        <Text>Display Time Range:</Text>
                        <Space.Compact style={{ marginTop: 4, width: '100%' }}>
                          <Input
                            type="number"
                            placeholder="Start (s)"
                            value={options.manualStartTime}
                            onChange={(e) => setOptions(prev => ({ ...prev, manualStartTime: Number(e.target.value) }))}
                            style={{ width: '50%' }}
                          />
                          <Input
                            type="number"
                            placeholder="End (s)"
                            value={options.manualEndTime}
                            onChange={(e) => setOptions(prev => ({ ...prev, manualEndTime: Number(e.target.value) }))}
                            style={{ width: '50%' }}
                          />
                        </Space.Compact>
                      </div>
                    )}
                  </>
                )}
              </Space>
            </div>
          </div>

          <div>
            <Text strong>Duration: {options.duration} seconds</Text>
            <Slider
              min={5}
              max={60}
              value={options.duration}
              onChange={(value) => setOptions(prev => ({ ...prev, duration: value }))}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text strong>Quality</Text>
            <Select
              value={options.quality}
              onChange={(value) => setOptions(prev => ({ ...prev, quality: value }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Select.Option value="low">Low (720p)</Select.Option>
              <Select.Option value="medium">Medium (1080p)</Select.Option>
              <Select.Option value="high">High (4K)</Select.Option>
              <Select.Option value="ultra">Ultra (8K)</Select.Option>
            </Select>
          </div>

          <div>
            <Text strong>Aspect Ratio</Text>
            <Select
              value={options.aspectRatio}
              onChange={(value) => setOptions(prev => ({ ...prev, aspectRatio: value }))}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Select.Option value="16:9">16:9 (Landscape)</Select.Option>
              <Select.Option value="9:16">9:16 (Portrait)</Select.Option>
              <Select.Option value="1:1">1:1 (Square)</Select.Option>
              <Select.Option value="4:3">4:3 (Standard)</Select.Option>
            </Select>
          </div>

          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={generateVideo}
            loading={isGenerating}
            size="large"
            block
          >
            {isGenerating ? 'Generating Video...' : 'Generate Video'}
          </Button>

          {isGenerating && (
            <div style={{ marginTop: 16 }}>
              <Text>Generation Progress: {Math.round(generationProgress)}%</Text>
              <Progress percent={generationProgress} status="active" />
            </div>
          )}
        </Space>
      </Card>

      {generatedVideos.length > 0 && (
        <Card title="Generated Videos">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {generatedVideos.map((video, index) => (
              <Card key={index} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Text strong>Video {index + 1}</Text>
                      {video.subtitles?.enabled && (
                        <Tag color="blue" icon={<FontSizeOutlined />}>
                          Subtitles Added
                        </Tag>
                      )}
                    </Space>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => downloadVideo(video, index)}
                    >
                      Download
                    </Button>
                  </div>
                  <video
                    controls
                    style={{ width: '100%', maxHeight: '300px' }}
                    src={video.url}
                  >
                    <track
                      kind="subtitles"
                      src={`data:text/vtt;charset=utf-8,${encodeURIComponent(generateVTTSubtitles(video))}`}
                      label="Generated Subtitles"
                      default
                    />
                    Your browser does not support the video tag.
                  </video>
                  <div>
                    <Text type="secondary">Prompt: {video.prompt}</Text>
                    <br />
                    <Text type="secondary">
                      Duration: {video.duration}s • Resolution: {video.resolution} • Format: {video.format}
                    </Text>
                    {video.subtitles?.enabled && (
                      <>
                        <br />
                        <Text type="secondary">
                          Subtitles: "{video.subtitles.text}" ({video.subtitles.position}, {video.subtitles.style})
                        </Text>
                      </>
                    )}
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default VideoGenerator;
