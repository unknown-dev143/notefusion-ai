import React, { useState, useEffect, useCallback } from 'react';
import { lectureService, LectureNote } from '../services/lectureService';
import { toast } from 'react-hot-toast';

interface LectureNotesManagerProps {
  onNewNote?: (note: string) => void;
  currentVideoTitle?: string;
}

export const LectureNotesManager: React.FC<LectureNotesManagerProps> = ({
  onNewNote,
  currentVideoTitle,
}) => {
  const [currentLecture, setCurrentLecture] = useState<LectureNote | null>(null);
  const [lectureHistory, setLectureHistory] = useState<LectureNote[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Set up event listeners
  useEffect(() => {
    // Handle new lecture detection
    lectureService.onNewLecture = (lecture) => {
      setCurrentLecture(lecture);
      toast.success(`New lecture detected: ${lecture.title}`, {
        position: 'bottom-right',
      });
    };

    // Handle lecture completion
    lectureService.onLectureComplete = (lecture) => {
      setLectureHistory((prev) => [lecture, ...prev]);
      toast.success(`Lecture marked as complete: ${lecture.title}`, {
        position: 'bottom-right',
      });
    };

    return () => {
      // Cleanup
      lectureService.onNewLecture = null;
      lectureService.onLectureComplete = null;
    };
  }, []);

  // Process new note content
  const processNote = useCallback(
    (content: string) => {
      if (!content.trim()) return;

      setIsProcessing(true);
      try {
        const lecture = lectureService.processNewContent(
          content,
          currentVideoTitle
        );
        
        if (lecture && onNewNote) {
          onNewNote(lecture.content);
        }
      } catch (error) {
        console.error('Error processing note:', error);
        toast.error('Failed to process note');
      } finally {
        setIsProcessing(false);
      }
    },
    [currentVideoTitle, onNewNote]
  );

  // Handle manual lecture completion
  const handleCompleteLecture = useCallback(() => {
    if (currentLecture) {
      lectureService.markCurrentLectureComplete();
      setCurrentLecture(null);
    }
  }, [currentLecture]);

  // Merge lectures
  const mergeLectures = useCallback((lectureIds: string[]) => {
    // In a real app, this would merge the lectures in your database
    // For now, we'll just update the local state
    setLectureHistory((prev) => {
      const toMerge = prev.filter((l) => lectureIds.includes(l.id));
      if (toMerge.length < 2) return prev;

      const merged: LectureNote = {
        id: `merged-${Date.now()}`,
        title: `Merged Lecture (${toMerge.length} parts)`,
        content: toMerge
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          .map((l) => `--- ${l.title} ---\n${l.content}`)
          .join('\n\n'),
        timestamp: new Date(),
        isComplete: true,
      };

      return [merged, ...prev.filter((l) => !lectureIds.includes(l.id))];
    });
  }, []);

  return (
    <div className="space-y-4">
      {currentLecture && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">
              Current Lecture: {currentLecture.title}
            </h3>
            <button
              onClick={handleCompleteLecture}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Complete Lecture'}
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto p-2 bg-white rounded border">
            {currentLecture.content}
          </div>
        </div>
      )}

      {lectureHistory.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-2">Previous Lectures</h3>
          <div className="space-y-2">
            {lectureHistory.map((lecture) => (
              <div
                key={lecture.id}
                className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  // In a real app, this would open the lecture for editing/viewing
                  toast.success(`Opening lecture: ${lecture.title}`);
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{lecture.title}</span>
                  <span className="text-sm text-gray-500">
                    {lecture.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {lecture.content.substring(0, 200)}
                  {lecture.content.length > 200 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
