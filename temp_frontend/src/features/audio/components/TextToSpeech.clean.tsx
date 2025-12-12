import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Select, Slider, message, Alert, Typography, Card, Space } from 'antd';
import { PlayCircleOutlined, StopOutlined, DownloadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

// Define TypeScript interfaces
interface Voice {
  voice_id: string;
  name: string;
  language?: string;
  gender?: string;
}

interface TextToSpeechProps {
  className?: string;
  initialText?: string;
}

// Mock TTS API function
const mockTtsApi = async (text: string, voiceId: string, speed: number, pitch: number): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `data:audio/mp3;base64,${btoa('mock-audio-data')}`;
};

// Mock voices data
const MOCK_VOICES: Voice[] = [
  { voice_id: 'en-US-Standard-A', name: 'English (US) - Female', language: 'en-US', gender: 'Female' },
  { voice_id: 'en-US-Standard-B', name: 'English (US) - Male', language: 'en-US', gender: 'Male' },
  { voice_id: 'en-GB-Standard-A', name: 'English (UK) - Female', language: 'en-GB', gender: 'Female' },
];

const TextToSpeech: React.FC<TextToSpeechProps> = ({ className = '', initialText = '' }) => {
  const [text, setText] = useState<string>(initialText);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        setIsLoading(true);
        setVoices(MOCK_VOICES);
        if (MOCK_VOICES.length > 0) {
          setSelectedVoice(MOCK_VOICES[0].voice_id);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load voices');
        console.error('Error loading voices:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVoices();
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (!text.trim()) {
      message.warning('Please enter some text to convert to speech');
      return;
    }

    if (!selectedVoice) {
      message.warning('Please select a voice');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Generate audio data
      const audioData = await mockTtsApi(text, selectedVoice, speed, pitch);
      setAudioUrl(audioData);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioData;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('Failed to generate or play audio');
      console.error('Error generating/playing audio:', err);
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, speed, pitch]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!audioUrl) {
      message.warning('No audio to download');
      return;
    }

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `tts-${new Date().getTime()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioUrl]);

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
  };

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
  };

  const handlePitchChange = (value: number) => {
    setPitch(value);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Card 
      title="Text to Speech" 
      className={className}
      loading={isLoading}
      actions={[
        <Button 
          key="play" 
          type="primary" 
          icon={isPlaying ? <StopOutlined /> : <PlayCircleOutlined />} 
          onClick={isPlaying ? handleStop : handlePlayPause}
          disabled={!text.trim() || !selectedVoice || isLoading}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </Button>,
        <Button 
          key="download" 
          icon={<DownloadOutlined />} 
          onClick={handleDownload}
          disabled={!audioUrl || isLoading}
        >
          Download
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          autoSize={{ minRows: 4, maxRows: 8 }}
          disabled={isLoading}
        />

        <div style={{ margin: '16px 0' }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Voice</Text>
          <Select
            value={selectedVoice}
            onChange={handleVoiceChange}
            style={{ width: '100%' }}
            disabled={isLoading || voices.length === 0}
            loading={isLoading}
          >
            {voices.map((voice) => (
              <Select.Option key={voice.voice_id} value={voice.voice_id}>
                {voice.name} {voice.language ? `(${voice.language})` : ''}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div style={{ margin: '16px 0' }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Speed: {speed.toFixed(1)}x</Text>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={speed}
            onChange={handleSpeedChange}
            disabled={isLoading}
            tooltip={{ formatter: (value) => `${value}x` }}
          />
        </div>

        <div style={{ margin: '16px 0' }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Pitch: {pitch.toFixed(1)}</Text>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={pitch}
            onChange={handlePitchChange}
            disabled={isLoading}
            tooltip={{ formatter: (value) => value?.toFixed(1) }}
          />
        </div>

        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          onError={(e) => {
            setError('Error playing audio');
            console.error('Audio playback error:', e);
            setIsPlaying(false);
          }}
          hidden
        />

        {error && (
          <Alert 
            message="Error" 
            description={error} 
            type="error" 
            showIcon 
            closable
            onClose={() => setError(null)}
            style={{ marginTop: 16 }}
          />
        )}
      </Space>
    </Card>
  );
};

export { TextToSpeech };
