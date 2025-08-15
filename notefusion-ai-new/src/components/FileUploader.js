import React from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudUploadIcon as CloudArrowUpIcon, 
  DocumentIcon, 
  VideoCameraIcon, 
  MusicNoteIcon as MusicalNoteIcon 
} from '@heroicons/react/outline';

const FileUploader = ({ onFilesUploaded }) => {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      onFilesUploaded(acceptedFiles);
    },
  });

  const getFileIcon = (file) => {
    if (file.type.startsWith('audio/')) {
      return MusicalNoteIcon;
    } else if (file.type.startsWith('video/')) {
      return VideoCameraIcon;
    } else {
      return DocumentIcon;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-600">
            or click to select files
          </p>
          <p className="text-xs text-gray-500">
            Supports PDF, audio, video, and text files
          </p>
        </div>
      </div>

      {acceptedFiles.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Selected Files</h4>
          <div className="space-y-2">
            {acceptedFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {file.type || 'Unknown type'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 