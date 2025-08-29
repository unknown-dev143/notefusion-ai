import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Typography, TextField, CircularProgress } from '@mui/material';
import { useApi } from '../../hooks/useApi';

// Define types locally since we can't import them
type FlashcardType = {
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
};

const FlashcardPage: React.FC = () => {
  const { noteId } = useParams<{ noteId?: string }>();
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newFlashcard, setNewFlashcard] = useState({ front: '', back: '' });
  const api = useApi();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        const endpoint = noteId 
          ? `/api/flashcards/note/${noteId}` 
          : '/api/flashcards';
        const data = await api.get<FlashcardType[]>(endpoint);
        setFlashcards(data);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [noteId]);

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
    );
  };

  const handleCreateFlashcard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const newCard = await api.post('/api/flashcards', {
        note_id: noteId || null,
        front_text: newFlashcard.front,
        back_text: newFlashcard.back,
        tags: []
      });
      
      setFlashcards([...flashcards, newCard]);
      setNewFlashcard({ front: '', back: '' });
    } catch (error) {
      console.error('Error creating flashcard:', error);
    }
  };

  const handleReview = async (quality: number) => {
    if (flashcards.length === 0) return;
    
    try {
      const currentCard = flashcards[currentIndex];
      if (!currentCard) return;
      
      await api.post(`/api/flashcards/${currentCard.id}/review`, { quality });
      
      // Update local state to reflect the review
      const updatedFlashcards = [...flashcards];
      const updatedCard = {
        ...currentCard,
        review_count: (currentCard.review_count || 0) + 1,
        last_reviewed: new Date().toISOString()
      };
      updatedFlashcards[currentIndex] = updatedCard;
      setFlashcards(updatedFlashcards);
      
      // Move to next card
      handleNext();
    } catch (error) {
      console.error('Error recording review:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {noteId ? 'Note Flashcards' : 'My Flashcards'}
      </Typography>

      {/* Create New Flashcard */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>Create New Flashcard</Typography>
        <form onSubmit={handleCreateFlashcard}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Front (Question)"
              value={newFlashcard.front}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlashcard({...newFlashcard, front: e.target.value})}
              required
              multiline
              rows={2}
            />
            <TextField
              label="Back (Answer)"
              value={newFlashcard.back}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlashcard({...newFlashcard, back: e.target.value})}
              required
              multiline
              rows={2}
            />
            <Box>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!newFlashcard.front || !newFlashcard.back}
              >
                Add Flashcard
              </Button>
            </Box>
          </Box>
        </form>
      </Card>

      {/* Flashcard Display */}
      {flashcards.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Card {currentIndex + 1} of {flashcards.length}
          </Typography>
          
          <Card 
            sx={{ 
              minHeight: 200, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              mb: 2,
              p: 3
            }}
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <CardContent>
              <Typography variant="h5" component="div" align="center" gutterBottom>
                {showAnswer ? 'Answer' : 'Question'}
              </Typography>
              <Typography variant="h4" component="div" align="center">
                {flashcards[currentIndex] ? (showAnswer ? flashcards[currentIndex].back_text : flashcards[currentIndex].front_text) : 'No card available'}
              </Typography>
              
              {showAnswer && (
                <Box mt={2} textAlign="center">
                  <Typography variant="body2" color="textSecondary">
                    How well did you know this?
                  </Typography>
                  <Box mt={1} display="flex" justifyContent="center" gap={1}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Button 
                        key={num} 
                        variant="outlined" 
                        size="small"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleReview(num);
                        }}
                      >
                        {num}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button 
              variant="outlined" 
              onClick={handlePrevious}
              disabled={flashcards.length <= 1}
            >
              Previous
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleNext}
              disabled={flashcards.length <= 1}
            >
              Next
            </Button>
          </Box>
          
          {/* Flashcard Stats */}
          <Box mt={4}>
            <Typography variant="h6">Flashcard Stats</Typography>
            <Typography>
              Total Cards: {flashcards.length}
            </Typography>
            {flashcards.some(card => card.review_count > 0) && (
              <Typography>
                Average Reviews: {(flashcards.reduce((sum, card) => sum + (card.review_count || 0), 0) / flashcards.length).toFixed(1)}
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No flashcards found. Create your first flashcard above!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FlashcardPage;
