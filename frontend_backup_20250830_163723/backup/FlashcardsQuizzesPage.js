import React from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/apiService';
import { Link } from 'react-router-dom';

function FlashcardsQuizzesPage() {
  // Get all sessions
  const { data: sessionsData, isLoading, error } = useQuery('sessions', apiService.getSessions);
  const sessions = sessionsData?.sessions || [];

  // Search/filter state
  const [search, setSearch] = React.useState('');
  const [filteredSessions, setFilteredSessions] = React.useState(sessions);

  React.useEffect(() => {
    if (!search) {
      setFilteredSessions(sessions);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredSessions(
      sessions.filter(session =>
        session.module_code?.toLowerCase().includes(lower) ||
        session.chapters?.toLowerCase().includes(lower)
      )
    );
  }, [search, sessions]);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">All Flashcards & Quizzes</h1>
      <div className="mb-6">
        <input
          type="text"
          className="w-full md:w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Search by module, chapter, flashcard, or quiz..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="card animate-pulse">Loading sessions...</div>
      ) : error ? (
        <div className="card text-red-600">Failed to load sessions.</div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-gray-500">No sessions found.</div>
      ) : (
        <div className="space-y-6">
          {filteredSessions.map(session => (
            <SessionFlashQuiz key={session.session_id} session={session} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionFlashQuiz({ session, search }) {
  const { data: flashcardsData, isLoading: flashcardsLoading } = useQuery(
    ['flashcards', session.session_id],
    () => apiService.getFlashcards(session.session_id),
    { enabled: !!session.session_id }
  );
  const flashcards = flashcardsData?.flashcards || [];

  const { data: quizData, isLoading: quizLoading } = useQuery(
    ['quiz', session.session_id],
    () => apiService.getQuiz(session.session_id),
    { enabled: !!session.session_id }
  );
  const quizQuestions = quizData?.questions || [];

  // Filter flashcards and quiz by search if provided
  let filteredFlashcards = flashcards;
  let filteredQuizQuestions = quizQuestions;
  if (search) {
    const lower = search.toLowerCase();
    filteredFlashcards = flashcards.filter(fc =>
      fc.front?.toLowerCase().includes(lower) ||
      fc.back?.toLowerCase().includes(lower) ||
      (fc.tags || []).some(tag => tag?.toLowerCase().includes(lower))
    );
    filteredQuizQuestions = quizQuestions.filter(q =>
      q.question?.toLowerCase().includes(lower) ||
      q.options.some(opt => opt?.toLowerCase().includes(lower)) ||
      q.explanation?.toLowerCase().includes(lower) ||
      q.topic_area?.toLowerCase().includes(lower)
    );
  }

  // Hide session if nothing matches
  if (search && filteredFlashcards.length === 0 && filteredQuizQuestions.length === 0) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold">{session.module_code}</h2>
          <p className="text-gray-600 text-sm">{session.chapters}</p>
        </div>
        <Link to={`/session/${session.session_id}`} className="btn btn-secondary">Go to Session</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flashcards */}
        <div>
          <h3 className="font-semibold mb-2">Flashcards</h3>
          {flashcardsLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : filteredFlashcards.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredFlashcards.map((fc, idx) => (
                <Flashcard key={idx} front={fc.front} back={fc.back} tags={fc.tags} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No flashcards.</div>
          )}
        </div>
        {/* Quiz */}
        <div>
          <h3 className="font-semibold mb-2">Quiz</h3>
          {quizLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : filteredQuizQuestions.length > 0 ? (
            <Quiz questions={filteredQuizQuestions} compact />
          ) : (
            <div className="text-gray-400">No quiz.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Flashcard Flip Card ---
function Flashcard({ front, back, tags }) {
  const [flipped, setFlipped] = React.useState(false);
  return (
    <div
      className={`card p-3 cursor-pointer transition-transform duration-300 ${flipped ? 'bg-blue-50' : 'bg-white'}`}
      onClick={() => setFlipped(f => !f)}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
    >
      <div className="font-semibold text-base mb-1">{flipped ? 'Answer' : 'Question'}</div>
      <div className="mb-2 text-gray-800 min-h-[40px]">{flipped ? back : front}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {tags && tags.map((tag, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{tag}</span>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-1">Click to flip</div>
    </div>
  );
}

// --- Quiz Display (compact) ---
function Quiz({ questions, compact }) {
  const [answers, setAnswers] = React.useState({});
  const [showResults, setShowResults] = React.useState(false);

  const handleSelect = (qIdx, optIdx) => {
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));
  };

  const score = questions.reduce((acc, q, idx) => {
    if (answers[idx] === q.correct_answer) return acc + 1;
    return acc;
  }, 0);

  return (
    <div className="space-y-4">
      {questions.slice(0, compact ? 2 : questions.length).map((q, idx) => (
        <div key={idx} className="card p-2">
          <div className="font-medium mb-1 text-sm">{q.question}</div>
          <div className="grid grid-cols-1 gap-1 mb-1">
            {q.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                className={`px-2 py-1 rounded border text-xs transition-colors duration-200 ${
                  showResults
                    ? oIdx === q.correct_answer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : answers[idx] === oIdx
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-white border-gray-200'
                    : answers[idx] === oIdx
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'bg-white border-gray-200'
                }`}
                disabled={showResults}
                onClick={() => handleSelect(idx, oIdx)}
              >
                {opt}
              </button>
            ))}
          </div>
          {showResults && (
            <div className="text-xs mt-1">
              {answers[idx] === q.correct_answer ? (
                <span className="text-green-700">Correct!</span>
              ) : (
                <span className="text-red-700">Incorrect. Correct answer: <b>{q.options[q.correct_answer]}</b></span>
              )}
              <div className="text-gray-500 mt-0.5">{q.explanation}</div>
              <div className="text-gray-400 mt-0.5">Difficulty: {q.difficulty} | Topic: {q.topic_area}</div>
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        {!showResults && (
          <button className="btn btn-primary btn-xs" onClick={() => setShowResults(true)}>
            Submit Quiz
          </button>
        )}
        {showResults && (
          <div className="text-sm font-bold">Score: {score} / {compact ? Math.min(2, questions.length) : questions.length}</div>
        )}
      </div>
    </div>
  );
}

export default FlashcardsQuizzesPage;
