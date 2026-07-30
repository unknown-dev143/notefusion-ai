import React, { useState, useEffect } from 'react';
import { Target, Clock, CheckCircle2, XCircle, AlertCircle, Brain, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'essay' | 'true-false';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface ExamSession {
  questions: Question[];
  currentQuestion: number;
  answers: Record<string, string>;
  timeRemaining: number;
  isCompleted: boolean;
  score?: number;
}

import { useNotes } from '../features/notes/context/NoteContext';

const Examiner: React.FC = () => {
  const { notes } = useNotes();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  useEffect(() => {
    if (session && !session.isCompleted) {
      const timer = setInterval(() => {
        setSession(prev => {
          if (!prev || prev.timeRemaining <= 0) return prev;
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session]);

  const generateQuestionsFromNotes = () => {
      if (!notes || notes.length < 3) {
          // Fallback if not enough notes
          return [
            {
              id: '1',
              question: 'Not enough notes to generate a unique exam. Create more notes to unlock AI generation.',
              type: 'true-false',
              options: ['Understood', 'Ignore'],
              correctAnswer: 'Understood',
              points: 0
            } as Question
          ];
      }

      const generated: Question[] = [];
      const usedNoteIds = new Set();
      const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).filter(t => t);

      // Generate 5 Questions
      for (let i = 0; i < 5; i++) {
          // Pick random note
          const availableNotes = notes.filter(n => !usedNoteIds.has(n.id));
          if (availableNotes.length === 0) break;
          
          const targetNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
          usedNoteIds.add(targetNote.id);
          
          // Strategy 1: Title -> Tag association
          if (targetNote.tags && targetNote.tags.length > 0 && Math.random() > 0.5) {
              const correctTag = targetNote.tags[0];
              const wrongTags = allTags.filter(t => t !== correctTag).sort(() => 0.5 - Math.random()).slice(0, 3);
              while (wrongTags.length < 3) wrongTags.push('General'); // Fallback filler

              generated.push({
                  id: `q-${i}`,
                  question: `Which concept is most closely associated with "${targetNote.title}"?`,
                  type: 'multiple-choice',
                  options: [correctTag, ...wrongTags].sort(() => 0.5 - Math.random()),
                  correctAnswer: correctTag,
                  points: 20
              });
          } 
          // Strategy 2: Content Snippet -> Title guessing
          else if (targetNote.content && targetNote.content.length > 50) {
              const snippet = targetNote.content.substring(0, 80) + '...';
              const wrongTitles = notes.filter(n => n.id !== targetNote.id).map(n => n.title).sort(() => 0.5 - Math.random()).slice(0, 3);
              
              generated.push({
                  id: `q-${i}`,
                  question: `Which note begins with this text: "${snippet}"?`,
                  type: 'multiple-choice',
                  options: [targetNote.title, ...wrongTitles].sort(() => 0.5 - Math.random()),
                  correctAnswer: targetNote.title,
                  points: 20
              });
          }
      }
      return generated;
  };

  const startExam = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/generate-exam`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();
      
      if (data.questions) {
        setSession({
          questions: data.questions,
          currentQuestion: 0,
          answers: {},
          timeRemaining: 900, // 15 minutes
          isCompleted: false
        });
        toast.success('Neural Exam Generated successfully!');
      } else {
         throw new Error(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('Exam Error:', error);
      toast.error('AI Link unstable. Generating local knowledge probe.');
      
      const dynamicQuestions = generateQuestionsFromNotes();
      setSession({
        questions: dynamicQuestions,
        currentQuestion: 0,
        answers: {},
        timeRemaining: 600,
        isCompleted: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!session) return;
    
    setSelectedAnswer(answer);
    setSession({
      ...session,
      answers: {
        ...session.answers,
        [session.questions[session.currentQuestion].id]: answer
      }
    });
  };

  const nextQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestion < session.questions.length - 1) {
      setSession({
        ...session,
        currentQuestion: session.currentQuestion + 1
      });
      setSelectedAnswer(session.answers[session.questions[session.currentQuestion + 1].id] || '');
    } else {
      submitExam();
    }
  };

  const submitExam = () => {
    if (!session) return;
    
    // Calculate score
    let score = 0;
    let totalPoints = 0;
    
    session.questions.forEach(q => {
      totalPoints += q.points;
      if (q.correctAnswer && session.answers[q.id] === q.correctAnswer) {
        score += q.points;
      }
    });
    
    const percentage = Math.round((score / totalPoints) * 100);
    
    setSession({
      ...session,
      isCompleted: true,
      score: percentage
    });
    
    toast.success(`Exam completed! Score: ${percentage}%`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 bg-white rounded-[32px] shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Target className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">The Examiner</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
            Generate a rigorous mock exam based on your knowledge base. The AI will create questions and grade your responses.
          </p>
          <button
            onClick={startExam}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? 'Generating Exam...' : 'Start Mock Exam'}
          </button>
        </div>
      </div>
    );
  }

  if (session.isCompleted) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 bg-white rounded-[32px] shadow-xl border border-slate-100">
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            (session.score || 0) >= 80 ? 'bg-emerald-100' : (session.score || 0) >= 60 ? 'bg-amber-100' : 'bg-rose-100'
          }`}>
            {(session.score || 0) >= 80 ? (
              <Trophy className="text-emerald-600" size={40} />
            ) : (session.score || 0) >= 60 ? (
              <CheckCircle2 className="text-amber-600" size={40} />
            ) : (
              <XCircle className="text-rose-600" size={40} />
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Exam Completed</h2>
          <div className="text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {session.score}%
          </div>
          <p className="text-slate-500 font-medium mb-8">
            {(session.score || 0) >= 80 
              ? 'Excellent work! You have a strong grasp of the material.'
              : (session.score || 0) >= 60
              ? 'Good effort! Review the areas you missed.'
              : 'Keep studying! Focus on the concepts you missed.'}
          </p>
          <button
            onClick={() => setSession(null)}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Start New Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQ = session.questions[session.currentQuestion];
  const progress = ((session.currentQuestion + 1) / session.questions.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Target className="text-rose-600" size={24} />
            <div>
              <h2 className="text-xl font-black text-slate-900">Mock Exam</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Question {session.currentQuestion + 1} of {session.questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200">
            <Clock className="text-rose-600" size={18} />
            <span className="font-black text-slate-900">{formatTime(session.timeRemaining)}</span>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-rose-600 to-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-blue-600" size={20} />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {currentQ.type.replace('-', ' ').toUpperCase()} • {currentQ.points} Points
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-6">{currentQ.question}</h3>
        </div>

        {/* Answer Options */}
        {currentQ.type === 'multiple-choice' || currentQ.type === 'true-false' ? (
          <div className="space-y-3">
            {currentQ.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-slate-300'
                  }`}>
                    {selectedAnswer === option && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="font-medium text-slate-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={selectedAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] font-medium"
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => {
              if (session.currentQuestion > 0) {
                setSession({
                  ...session,
                  currentQuestion: session.currentQuestion - 1
                });
                setSelectedAnswer(session.answers[session.questions[session.currentQuestion - 1].id] || '');
              }
            }}
            disabled={session.currentQuestion === 0}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={nextQuestion}
            className="px-8 py-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {session.currentQuestion === session.questions.length - 1 ? 'Submit Exam' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Examiner;
