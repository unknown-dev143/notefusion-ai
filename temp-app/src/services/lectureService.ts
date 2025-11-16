import { v4 as uuidv4 } from 'uuid';

export interface LectureNote {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  lectureNumber?: number;
  isComplete: boolean;
  videoId?: string;
}

class LectureService {
  private currentLecture: LectureNote | null = null;
  private lectureTimeout: NodeJS.Timeout | null = null;
  private readonly LECTURE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes of inactivity
  private readonly MIN_CONTENT_LENGTH = 20; // Minimum chars to consider as valid note

  // Callback for when a new lecture is detected
  public onNewLecture: ((lecture: LectureNote) => void) | null = null;
  
  // Callback for when a lecture is marked as complete
  public onLectureComplete: ((lecture: LectureNote) => void) | null = null;

  public processNewContent(content: string, videoTitle?: string): LectureNote | null {
    if (!content || content.length < this.MIN_CONTENT_LENGTH) {
      return null;
    }

    const now = new Date();
    
    // Check if this is a new lecture
    if (!this.currentLecture || this.isNewLecture(content, now)) {
      const prevLecture = this.currentLecture;
      
      // Mark previous lecture as complete if exists
      if (prevLecture) {
        this.markLectureComplete(prevLecture);
      }

      // Create new lecture
      this.currentLecture = {
        id: uuidv4(),
        title: videoTitle || `Lecture ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        content,
        timestamp: now,
        lectureNumber: this.getNextLectureNumber(),
        isComplete: false,
      };

      // Notify about new lecture
      if (this.onNewLecture) {
        this.onNewLecture(this.currentLecture);
      }
    } else {
      // Add to existing lecture
      if (this.currentLecture) {
        this.currentLecture.content += `\n\n${content}`;
        this.currentLecture.timestamp = now;
      }
    }

    // Reset the inactivity timer
    this.resetInactivityTimer();
    
    return this.currentLecture;
  }

  public markCurrentLectureComplete(): void {
    if (this.currentLecture && !this.currentLecture.isComplete) {
      this.markLectureComplete(this.currentLecture);
      this.currentLecture = null;
    }
  }

  private markLectureComplete(lecture: LectureNote): void {
    if (lecture.isComplete) return;
    
    lecture.isComplete = true;
    if (this.onLectureComplete) {
      this.onLectureComplete(lecture);
    }
  }

  private isNewLecture(content: string, currentTime: Date): boolean {
    if (!this.currentLecture) return true;
    
    const timeSinceLastUpdate = currentTime.getTime() - this.currentLecture.timestamp.getTime();
    
    // Consider it a new lecture if:
    // 1. More than 30 minutes since last update
    // 2. Content starts with a number (possible lecture number)
    // 3. Content contains lecture-related keywords
    const hasLectureNumber = /^\s*lecture\s+\d+/i.test(content) || /^\s*\d+\s*[.:]/.test(content);
    const hasLectureKeywords = /lecture|class|chapter|unit|part/i.test(content);
    
    return timeSinceLastUpdate > 30 * 60 * 1000 || hasLectureNumber || hasLectureKeywords;
  }

  private resetInactivityTimer(): void {
    if (this.lectureTimeout) {
      clearTimeout(this.lectureTimeout);
    }

    this.lectureTimeout = setTimeout(() => {
      if (this.currentLecture) {
        this.markCurrentLectureComplete();
      }
    }, this.LECTURE_TIMEOUT_MS);
  }

  private getNextLectureNumber(): number {
    // In a real app, this would fetch from your database
    // For now, we'll use a simple counter
    return 1; // You'll want to implement proper lecture number tracking
  }
}

export const lectureService = new LectureService();
