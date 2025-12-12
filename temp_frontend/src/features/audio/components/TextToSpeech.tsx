import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Select, Slider, message, Alert, Typography, Card } from 'antd';
import { PlayCircleOutlined, StopOutlined, DownloadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

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

const mockTtsApi = async (text: string, voiceId: string, speed: number, pitch: number): Promise<string> => {
  // Simulate API call delay based on text length and speed
  const delay = Math.min(1000, Math.max(300, text.length / 10)) / Math.max(0.5, Math.min(2, speed));
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Create a more realistic mock response using the parameters
  const mockData = {
    text: text.substring(0, 100), // Truncate for display
    voiceId,
    speed,
    pitch,
    timestamp: new Date().toISOString()
  };
  
  // Return a mock audio data URL with the parameters encoded
  return `data:audio/mp3;base64,${btoa(JSON.stringify(mockData))}`;
};

const MOCK_VOICES: Voice[] = [
  { voice_id: 'en-US-Standard-A', name: 'English (US) - Female', language: 'en-US', gender: 'Female' },
  { voice_id: 'en-US-Standard-B', name: 'English (US) - Male', language: 'en-US', gender: 'Male' },
  { voice_id: 'en-GB-Standard-A', name: 'English (UK) - Female', language: 'en-GB', gender: 'Female' },
];

const TextToSpeech: React.FC<TextToSpeechProps> = ({ className = '', initialText = '' }) => {
  // State management
  const [text, setText] = useState<string>(initialText);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [voices, setVoices] = useState<Voice[]>([]);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load available voices on component mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call to get available voices
        setVoices(MOCK_VOICES);
        if (MOCK_VOICES.length > 0 && MOCK_VOICES[0]) {
          setSelectedVoice(MOCK_VOICES[0].voice_id);
        }
        setError(null);
      } catch (err) {
        const error = err as Error;
        setError('Failed to load voices');
        console.error('Error loading voices:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVoices();
  }, []);

  // Handle play/pause button click
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
      
      // Generate audio data using the mock API
      const audioData = await mockTtsApi(text, selectedVoice, speed, pitch);
      setAudioUrl(audioData);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioData;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      const error = err as Error;
      setError('Failed to generate or play audio');
      console.error('Error generating/playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, speed, pitch]);

  // Handle stop button click
  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Handle download button click
  const handleDownload = useCallback(() => {
    if (!audioUrl) {
      message.warning('No audio to download');
      return;
    }
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'speech.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioUrl]);

  // Handle voice selection change
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  // Handle speed slider change
  const handleSpeedChange = (value: number) => {
    setSpeed(value);
  };

  // Handle pitch slider change
  const handlePitchChange = (value: number) => {
    setPitch(value);
  };

  // Handle audio playback end
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`text-to-speech ${className}`}>
      <Card title="Text to Speech" className="mb-4">
        <div className="space-y-4">
          {/* Text input area */}
          <div>
            <Text strong>Enter your text:</Text>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Type or paste your text here..."
              className="mt-2"
            />
          </div>

          {/* Voice selection */}
          <div>
            <Text strong>Select Voice:</Text>
            <Select
              value={selectedVoice}
              onChange={handleVoiceChange}
              className="w-full mt-2"
              loading={isLoading}
              disabled={isLoading}
            >
              {voices.map((voice) => (
                <Select.Option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Speed control */}
          <div>
            <Text strong>Speed: {speed.toFixed(1)}x</Text>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={speed}
              onChange={handleSpeedChange}
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          {/* Pitch control */}
          <div>
            <Text strong>Pitch: {pitch.toFixed(1)}</Text>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={pitch}
              onChange={handlePitchChange}
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              type="primary"
              icon={isPlaying ? <StopOutlined /> : <PlayCircleOutlined />}
              onClick={isPlaying ? handleStop : handlePlayPause}
              loading={isLoading}
              disabled={!text.trim() || !selectedVoice}
            >
              {isPlaying ? 'Stop' : 'Play'}
            </Button>
            
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!audioUrl || isLoading}
            >
              Download
            </Button>
          </div>

          {/* Error display */}
          {error && (
            <Alert message="Error" description={error} type="error" showIcon className="mt-4" />
          )}
        </div>
      </Card>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        style={{ display: 'none' }}
      />
    </div>
  );
};

// Export the component as a named export to ensure proper type checking
export { TextToSpeech };

export default TextToSpeech;
