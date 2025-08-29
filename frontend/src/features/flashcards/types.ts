export interface Flashcard {
  id: string;
  user_id: string;
  note_id: string | null;
  front_text: string;
  back_text: string;
  ease_factor: number;
  interval: number;
  due_date: string;
  last_reviewed: string | null;
  review_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface FlashcardCreate {
  note_id: string | null;
  front_text: string;
  back_text: string;
  tags: string[];
}

export interface FlashcardReview {
  quality: number; // 0-5
}

export interface FlashcardStats {
  total: number;
  due: number;
  new: number;
  average_ease: number;
  review_count: number;
}
