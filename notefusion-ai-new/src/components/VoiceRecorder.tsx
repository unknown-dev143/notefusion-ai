<<<<<<< HEAD
import React, { useEffect, useRef, useState } from 'react';

interface VoiceRecorderProps {
  onDataAvailable: (data: Blob) => void;
  isRecording: boolean;
  onStatusChange: (status: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onDataAvailable,
  isRecording,
  onStatusChange,
}) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let stream: MediaStream;

    const initializeRecorder = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            onDataAvailable(event.data);
          }
        };

        mediaRecorder.current.onstart = () => {
          onStatusChange('Recording...');
        };

        mediaRecorder.current.onstop = () => {
          onStatusChange('Stopped');
        };

        mediaRecorder.current.onerror = (event: Event) => {
          const errorMessage = (event as any).error?.message || 'Unknown error';
          setError('Recording error: ' + errorMessage);
          onStatusChange('Error');
        };

      } catch (err) {
        setError('Error accessing microphone: ' + err);
        onStatusChange('Error');
      }
    };

    initializeRecorder();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onDataAvailable, onStatusChange]);

  useEffect(() => {
    if (isRecording && mediaRecorder.current?.state === 'inactive') {
      mediaRecorder.current?.start(1000); // Send data every second
    } else if (!isRecording && mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current?.stop();
    }
  }, [isRecording]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Voice Recorder</h3>
        <div className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
=======
import React, { useEffect, useRef, useState } from 'react';

interface VoiceRecorderProps {
  onDataAvailable: (data: Blob) => void;
  isRecording: boolean;
  onStatusChange: (status: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onDataAvailable,
  isRecording,
  onStatusChange,
}) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let stream: MediaStream;

    const initializeRecorder = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);

        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            onDataAvailable(event.data);
          }
        };

        mediaRecorder.current.onstart = () => {
          onStatusChange('Recording...');
        };

        mediaRecorder.current.onstop = () => {
          onStatusChange('Stopped');
        };

        mediaRecorder.current.onerror = (event: Event) => {
          const errorMessage = (event as any).error?.message || 'Unknown error';
          setError('Recording error: ' + errorMessage);
          onStatusChange('Error');
        };

      } catch (err) {
        setError('Error accessing microphone: ' + err);
        onStatusChange('Error');
      }
    };

    initializeRecorder();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onDataAvailable, onStatusChange]);

  useEffect(() => {
    if (isRecording && mediaRecorder.current?.state === 'inactive') {
      mediaRecorder.current?.start(1000); // Send data every second
    } else if (!isRecording && mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current?.stop();
    }
  }, [isRecording]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Voice Recorder</h3>
        <div className={`h-3 w-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
