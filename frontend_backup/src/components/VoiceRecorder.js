<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
=======
import React, { useState, useRef, useEffect } from 'react';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import { 
  MicrophoneIcon, 
  StopIcon, 
  PlayIcon, 
  PauseIcon 
<<<<<<< HEAD
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const VoiceRecorder = ({ onTranscriptUpdate, isRecording, setIsRecording }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [wsConnection, setWsConnection] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstart = () => {
        setAudioChunks(chunks);
        setIsRecording(true);
        setIsPaused(false);
        setRecordingTime(0);
        
        // Start timer
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

        // Start WebSocket connection for real-time transcription
        const ws = new WebSocket('ws://localhost:8000/ws/recording');
        ws.onopen = () => {
          console.log('WebSocket connected');
        };
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.transcript) {
            onTranscriptUpdate(data.full_transcript);
          }
        };
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        setWsConnection(ws);
      };

      recorder.onstop = () => {
        setIsRecording(false);
        setIsPaused(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (wsConnection) {
          wsConnection.close();
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      toast.success('Recording stopped');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
        toast.success('Recording resumed');
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
        toast.success('Recording paused');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <MicrophoneIcon className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
            </div>
            
            <button
              onClick={pauseRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {isPaused ? (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <PauseIcon className="w-4 h-4" />
                  <span>Pause</span>
                </>
              )}
            </button>
            
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <StopIcon className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Recording in progress... Audio is being transcribed in real-time.
          </p>
          <div className="mt-2 flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            <span className="text-sm text-blue-600">Live transcription active</span>
          </div>
        </div>
      )}

      {!isRecording && recordingTime > 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Recording completed. Total duration: {formatTime(recordingTime)}
          </p>
        </div>
      )}
    </div>
  );
};

=======
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

const VoiceRecorder = ({ onTranscriptUpdate, isRecording, setIsRecording }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [wsConnection, setWsConnection] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstart = () => {
        setAudioChunks(chunks);
        setIsRecording(true);
        setIsPaused(false);
        setRecordingTime(0);
        
        // Start timer
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

        // Start WebSocket connection for real-time transcription
        const ws = new WebSocket('ws://localhost:8000/ws/recording');
        ws.onopen = () => {
          console.log('WebSocket connected');
        };
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.transcript) {
            onTranscriptUpdate(data.full_transcript);
          }
        };
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        setWsConnection(ws);
      };

      recorder.onstop = () => {
        setIsRecording(false);
        setIsPaused(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (wsConnection) {
          wsConnection.close();
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      toast.success('Recording stopped');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
        toast.success('Recording resumed');
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
        toast.success('Recording paused');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <MicrophoneIcon className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
            </div>
            
            <button
              onClick={pauseRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {isPaused ? (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <PauseIcon className="w-4 h-4" />
                  <span>Pause</span>
                </>
              )}
            </button>
            
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <StopIcon className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Recording in progress... Audio is being transcribed in real-time.
          </p>
          <div className="mt-2 flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            <span className="text-sm text-blue-600">Live transcription active</span>
          </div>
        </div>
      )}

      {!isRecording && recordingTime > 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Recording completed. Total duration: {formatTime(recordingTime)}
          </p>
        </div>
      )}
    </div>
  );
};

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
export default VoiceRecorder; 