import React, { useState, useEffect } from 'react';
import { Brain, Calendar, TrendingUp, CheckCircle, XCircle, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  lastReviewed: Date | null;
  deck: string;
}

const SpacedRepetition: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardDeck, setNewCardDeck] = useState('General');
  const [stats, setStats] = useState({
    total: 0,
    due: 0,
    mastered: 0,
    learning: 0
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/learning/recall-queue`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const mapped = data.map((c: any) => ({
        id: c.id.toString(),
        front: c.front,
        back: c.back,
        easeFactor: c.ease_factor,
        interval: c.interval,
        repetitions: c.repetitions,
        nextReview: new Date(c.next_review),
        lastReviewed: c.last_reviewed ? new Date(c.last_reviewed) : null,
        deck: c.deck
      }));

      setFlashcards(mapped);
      setDueCards(mapped);
      setCurrentCard(mapped[0] || null);
      
      setStats({
        total: mapped.length, // This is just due cards for now, but we'll assume it's total for the view
        due: mapped.length,
        mastered: mapped.filter((c: any) => c.repetitions >= 5).length,
        learning: mapped.filter((c: any) => c.repetitions > 0 && c.repetitions < 5).length
      });
    } catch (err) {
      console.error('Failed to load flashcards');
    }
  };

  const handleCreateCard = async () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      toast.error('Please fill in both sides of the card');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/learning/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          front: newCardFront.trim(),
          back: newCardBack.trim(),
          deck: newCardDeck || 'General'
        })
      });
      if (!response.ok) throw new Error();
      toast.success('Flashcard Created!');
      setShowCreateModal(false);
      setNewCardFront('');
      setNewCardBack('');
      loadFlashcards();
    } catch (err) {
      toast.error('Failed to create card');
    }
  };

  // SM-2 Algorithm Implementation
  const calculateNextReview = (card: Flashcard, quality: number): Flashcard => {
    let { easeFactor, interval, repetitions } = card;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...card,
      easeFactor,
      interval,
      repetitions,
      nextReview,
      lastReviewed: new Date()
    };
  };

  const handleResponse = async (quality: number) => {
    if (!currentCard) return;

    try {
      const response = await fetch(`${API_BASE}/api/v1/learning/recall/${currentCard.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ quality })
      });
      if (!response.ok) throw new Error();
      
      const qualityText = quality >= 4 ? 'Great!' : quality >= 3 ? 'Good!' : 'Keep practicing!';
      toast.success(qualityText);
      setShowAnswer(false);
      loadFlashcards(); // Refresh from backend to get next review date etc
    } catch (err) {
       toast.error('Failed to sync response');
    }
  };

  const getDifficultyColor = (quality: number) => {
    if (quality >= 4) return 'emerald';
    if (quality >= 3) return 'blue';
    if (quality >= 2) return 'amber';
    return 'red';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-slide-up">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[24px] flex items-center justify-center shadow-xl">
              <Brain size={32} className="text-white"/>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 leading-none">Spaced Repetition</h1>
              <p className="text-sm text-slate-400 font-medium mt-1">Smart flashcard review with SM-2 algorithm</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            + New Card
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Brain size={24} className="text-blue-600"/>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-2xl font-black text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Calendar size={24} className="text-orange-600"/>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Due Today</p>
              <p className="text-2xl font-black text-orange-600">{stats.due}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-600"/>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mastered</p>
              <p className="text-2xl font-black text-emerald-600">{stats.mastered}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600"/>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Learning</p>
              <p className="text-2xl font-black text-purple-600">{stats.learning}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Display */}
      {currentCard ? (
        <div className="bg-white border border-slate-100 rounded-[48px] p-12 shadow-2xl mb-8">
          {/* Card Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-black uppercase tracking-wider">
                {currentCard.deck}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {dueCards.indexOf(currentCard) + 1} / {dueCards.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-purple-600 uppercase tracking-widest">
                Reviewing
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="min-h-[300px] flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                {showAnswer ? 'Answer' : 'Question'}
              </p>
              <p className="text-3xl font-black text-slate-900 leading-tight max-w-2xl">
                {showAnswer ? currentCard.back : currentCard.front}
              </p>
            </div>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-purple-200 hover:scale-105 active:scale-95 transition-all"
              >
                Show Answer
              </button>
            ) : (
              <div className="w-full max-w-2xl">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center mb-4">
                  How well did you know this?
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { quality: 0, label: 'Again', color: 'red' },
                    { quality: 1, label: 'Hard', color: 'orange' },
                    { quality: 2, label: 'Good', color: 'amber' },
                    { quality: 3, label: 'Easy', color: 'blue' },
                    { quality: 4, label: 'Perfect', color: 'emerald' }
                  ].map((option) => (
                    <button
                      key={option.quality}
                      onClick={() => handleResponse(option.quality)}
                      className={`py-4 bg-${option.color}-100 text-${option.color}-700 rounded-2xl font-black text-xs hover:bg-${option.color}-200 transition-all hover:scale-105 active:scale-95`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card Stats */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Repetitions</p>
                <p className="text-xl font-black text-slate-900">{currentCard.repetitions}</p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Interval</p>
                <p className="text-xl font-black text-slate-900">{currentCard.interval} days</p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ease Factor</p>
                <p className="text-xl font-black text-slate-900">{currentCard.easeFactor.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-[48px] p-16 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={48} className="text-emerald-600"/>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-3">
            All Done for Today!
          </h3>
          <p className="text-slate-600 font-medium mb-8 max-w-md mx-auto">
            You've reviewed all cards due today. Great work! Come back tomorrow for more reviews.
          </p>
          <button
            onClick={loadFlashcards}
            className="px-12 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3"
          >
            <RotateCw size={20}/>
            Review Again
          </button>
        </div>
      )}

      {/* SM-2 Algorithm Info */}
      <div className="mt-8 p-8 bg-white border border-slate-100 rounded-[48px] shadow-lg">
        <h3 className="text-xl font-black text-slate-900 mb-6">How Spaced Repetition Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-2">SM-2 Algorithm</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Uses scientifically proven spacing intervals to optimize long-term retention
            </p>
          </div>
          <div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-2">Adaptive Learning</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Adjusts review intervals based on your performance for each card
            </p>
          </div>
          <div>
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <p className="text-sm font-black text-slate-900 mb-2">Optimal Timing</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Reviews cards just before you're about to forget them
            </p>
          </div>
        </div>
      </div>

      {/* Create Flashcard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-[48px] p-12 shadow-2xl w-full max-w-lg mx-4 animate-slide-up">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-8 right-8 w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
            >✕</button>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-[20px] flex items-center justify-center shadow-xl mb-8">
              <Brain size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">New Flashcard</h2>
            <p className="text-sm text-slate-400 font-medium mb-10">Create a new card for your study deck</p>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Question (Front)</label>
                <textarea
                  value={newCardFront}
                  onChange={e => setNewCardFront(e.target.value)}
                  placeholder="What is...?"
                  rows={3}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none placeholder:text-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Answer (Back)</label>
                <textarea
                  value={newCardBack}
                  onChange={e => setNewCardBack(e.target.value)}
                  placeholder="The answer is..."
                  rows={3}
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none placeholder:text-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Deck Name</label>
                <input
                  value={newCardDeck}
                  onChange={e => setNewCardDeck(e.target.value)}
                  placeholder="General"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-300"
                />
              </div>
              <button
                onClick={handleCreateCard}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-200 hover:scale-105 active:scale-95 transition-all"
              >
                Create Flashcard →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpacedRepetition;
