import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  DocumentArrowDownIcon, 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { apiService, downloadFile } from '../services/apiService';
import DiagramCanvas from '../components/DiagramCanvas';
import toast from 'react-hot-toast';
import { useNotification } from '../components/NotificationProvider';
import { useNotification } from '../components/NotificationProvider';
import ReactMarkdown from 'react-markdown';

const SessionPage = () => {
  const { sessionId } = useParams();
  const [activeTab, setActiveTab] = useState('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [voice, setVoice] = useState('Default');
  const [style, setStyle] = useState('Default');
  const [duration, setDuration] = useState(5);
  const [includeDiagrams, setIncludeDiagrams] = useState(false);

  const { showNotification } = useNotification();

  const { data: session, isLoading, error } = useQuery(
    ['session', sessionId],
    () => apiService.getSession(sessionId),
    {
      onError: (error) => {
        showNotification('error', 'Failed to load session');
      }
    }
  );

  const { data: diagramsData, isLoading: diagramsLoading } = useQuery(
    ['diagrams', sessionId],
    () => apiService.getDiagrams(sessionId),
    { enabled: !!sessionId }
  );
  const diagrams = diagramsData?.diagrams || [];

  // Flashcards
  const { data: flashcardsData, isLoading: flashcardsLoading, error: flashcardsError } = useQuery(
    ['flashcards', sessionId],
    () => apiService.getFlashcards(sessionId),
    { enabled: !!sessionId }
  );
  const flashcards = flashcardsData?.flashcards || [];

  // Quiz
  const { data: quizData, isLoading: quizLoading, error: quizError } = useQuery(
    ['quiz', sessionId],
    () => apiService.getQuiz(sessionId),
    { enabled: !!sessionId }
  );
  const quizQuestions = quizData?.questions || [];

  // Default to include diagrams if present
  React.useEffect(() => {
    if (diagrams.length > 0) setIncludeDiagrams(true);
  }, [diagrams.length]);

  // --- Video Generator UI ---
  const videoSection = (
    <div className="card p-4 my-4">
      <h2 className="text-xl font-bold mb-2">Generate Video Presentation</h2>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Voice</label>
          <select value={voice} onChange={e => setVoice(e.target.value)} className="border rounded px-2 py-1">
            <option value="Default">Default</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Style</label>
          <select value={style} onChange={e => setStyle(e.target.value)} className="border rounded px-2 py-1">
            <option value="Default">Default</option>
            <option value="modern">Modern</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Seconds per Slide</label>
          <input type="number" min={2} max={30} value={duration} onChange={e => setDuration(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="includeDiagrams" checked={includeDiagrams} onChange={e => setIncludeDiagrams(e.target.checked)} className="mr-2" />
          <label htmlFor="includeDiagrams" className="text-sm">Include Diagrams</label>
        </div>
        <button
          className="btn btn-primary px-4 py-2"
          onClick={handleGenerateVideo}
          disabled={videoLoading || !session?.fused_notes}
        >
          {videoLoading ? 'Generating...' : 'Generate Video'}
        </button>
      </div>
      {videoError && <div className="text-red-600 mt-2">{videoError}</div>}
      {videoUrl && (
        <div className="mt-4">
          <video src={videoUrl} controls className="w-full max-w-2xl mb-2" />
          <a href={videoUrl} download="session_video.mp4" className="btn btn-secondary">Download Video</a>
        </div>
      )}
    </div>
  );

  const handleExport = async (format) => {
    try {
      let response;
      let filename;
      
      switch (format) {
        case 'markdown':
          response = await apiService.exportMarkdown(sessionId);
          filename = `${session?.module_code}_notes.md`;
          break;
        case 'pdf':
          response = await apiService.exportPDF(sessionId);
          filename = `${session?.module_code}_notes.pdf`;
          break;
        case 'flashcards':
          response = await apiService.exportFlashcards(sessionId);
          filename = `${session?.module_code}_flashcards.txt`;
          break;
        default:
          return;
      }
      
      downloadFile(response, filename);
      toast.success(`${format.toUpperCase()} exported successfully`);
    } catch (error) {
      toast.error(`Failed to export ${format}`);
    }
  };

  const tabs = [
    { id: 'notes', name: 'Notes', icon: BookOpenIcon },
    { id: 'questions', name: 'Practice Questions', icon: QuestionMarkCircleIcon },
    { id: 'summary', name: 'Summary', icon: AcademicCapIcon },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Session not found</h3>
        <p className="text-gray-600">The requested session could not be loaded.</p>
      </div>
    );
  }

  const fusedNotes = session.fused_notes || {};
  const sections = fusedNotes.sections || [];

  // Filter sections based on search
  const filteredSections = sections.filter(section => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return section.title.toLowerCase().includes(searchLower) ||
           section.content?.some(item => item.text?.toLowerCase().includes(searchLower));
  });

  const handleGenerateVideo = async () => {
    setVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    try {
      const payload = {
        notes: session.fused_notes,
        voice: voice !== 'Default' ? voice : undefined,
        style: style !== 'Default' ? style : undefined,
        duration_per_slide: duration,
      };
      if (includeDiagrams && diagrams.length > 0) {
        payload.diagrams = diagrams;
      }
      // Submit async video job
      const jobResp = await apiService.submitVideoJob(payload);
      const jobId = jobResp.job_id;
      if (!jobId) throw new Error('No job ID returned');
      toast.success('Video job submitted! Processing...');
      // Poll for status
      let statusResp, tries = 0;
      const maxTries = 300; // ~25min if 5s interval
      while (tries < maxTries) {
        await new Promise(res => setTimeout(res, 5000));
        statusResp = await apiService.getVideoJobStatus(jobId);
        if (statusResp.status === 'SUCCESS') break;
        if (statusResp.status === 'FAILURE') throw new Error(statusResp.error || 'Video generation failed');
        tries++;
      }
      if (statusResp.status !== 'SUCCESS') throw new Error('Video generation timed out');
      // Download video
      const blob = await apiService.downloadVideoJobResult(jobId);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      toast.success('Video generated!');
    } catch (error) {
      setVideoError(error.message || 'Failed to generate video');
      toast.error(error.message || 'Failed to generate video');
    }
    setVideoLoading(false);
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Video Generator UI */}
      {videoSection}
      {/* Diagrams Display */}
      {diagramsLoading ? (
        <div className="card animate-pulse">Loading diagrams...</div>
      ) : diagrams.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Attached Diagrams</h2>
          {diagrams.map((diagram, idx) => (
            <DiagramCanvas
              key={diagram.diagram_id || idx}
              initialData={diagram.diagram_data}
              onSave={() => {}}
            />
          ))}
        </div>
      ) : null}

      {/* Flashcards Display */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Flashcards</h2>
        {flashcardsLoading ? (
          <div className="card animate-pulse">Loading flashcards...</div>
        ) : flashcardsError ? (
          <div className="card text-red-600">Failed to load flashcards.</div>
        ) : flashcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((fc, idx) => (
              <Flashcard key={idx} front={fc.front} back={fc.back} tags={fc.tags} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No flashcards available.</div>
        )}
      </div>

      {/* Quiz Display */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Quiz</h2>
        {quizLoading ? (
          <div className="card animate-pulse">Loading quiz...</div>
        ) : quizError ? (
          <div className="card text-red-600">Failed to load quiz.</div>
        ) : quizQuestions.length > 0 ? (
          <Quiz questions={quizQuestions} />
        ) : (
          <div className="text-gray-500">No quiz available.</div>
        )}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.module_code}</h1>
          <p className="text-gray-600">{session.chapters}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            session.detail_level === 'concise' ? 'bg-green-100 text-green-800' :
            session.detail_level === 'standard' ? 'bg-blue-100 text-blue-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {session.detail_level}
          </span>
        </div>
      </div>

      {/* Export Actions */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('markdown')}
                className="btn-secondary flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Markdown</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="btn-secondary flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('flashcards')}
                className="btn-secondary flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Flashcards</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>Created {new Date(session.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search in notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Video Generator UI */}
            <div className="card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Video Generator</h3>
                <button
                  className="btn-primary px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleGenerateVideo}
                  disabled={videoLoading}
                >
                  {videoLoading ? 'Generating...' : 'Generate Video'}
                </button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex flex-col">
                  <span className="font-medium">Voice</span>
                  <select className="border rounded px-2 py-1 mt-1" value={voice} onChange={e => setVoice(e.target.value)}>
                    <option value="Default">Default</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Robot">Robot</option>
                  </select>
                </label>
                <label className="flex flex-col">
                  <span className="font-medium">Style</span>
                  <select className="border rounded px-2 py-1 mt-1" value={style} onChange={e => setStyle(e.target.value)}>
                    <option value="Default">Default</option>
                    <option value="Dark">Dark</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Colorful">Colorful</option>
                  </select>
                </label>
                {diagrams.length > 0 && (
                  <label className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      checked={includeDiagrams}
                      onChange={e => setIncludeDiagrams(e.target.checked)}
                    />
                    <span>Include all attached diagrams</span>
                  </label>
                )}
              </div>
              {videoError && <div className="text-red-500">{videoError}</div>}
              {videoUrl && (
                <div className="flex flex-col gap-2">
                  <video src={videoUrl} controls className="w-full max-w-2xl rounded border" />
                  <a
                    href={videoUrl}
                    download={`session_${sessionId}_ai_video.mp4`}
                    className="btn-secondary inline-block mt-2"
                  >
                    Download Video
                  </a>
                </div>
              )}
            </div>
            {fusedNotes.summary && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                <div className="prose max-w-none">
                  <ReactMarkdown>{fusedNotes.summary}</ReactMarkdown>
                </div>
              </div>
            )}
            
            {filteredSections.map((section, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                  {section.estimated_study_time_minutes && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>{section.estimated_study_time_minutes} min</span>
                    </div>
                  )}
                </div>
                
                <div className="prose max-w-none">
                  {section.content?.map((item, itemIndex) => (
                    <div key={itemIndex} className="mb-3">
                      {item.type === 'heading' && (
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.text} <span className="text-sm text-gray-500">{item.source}</span>
                        </h4>
                      )}
                      {item.type === 'bullet' && (
                        <p className="mb-2">
                          • {item.text} <span className="text-sm text-gray-500">{item.source}</span>
                        </p>
                      )}
                      {item.type === 'definition' && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-3">
                          <p className="font-semibold text-gray-900">{item.text}</p>
                          <span className="text-sm text-gray-500">{item.source}</span>
                        </div>
                      )}
                      {item.type === 'example' && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-3">
                          <p className="text-gray-900"><em>Example: {item.text}</em></p>
                          <span className="text-sm text-gray-500">{item.source}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {section.key_takeaways && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Takeaways</h4>
                    <ul className="space-y-1">
                      {section.key_takeaways.map((takeaway, takeawayIndex) => (
                        <li key={takeawayIndex} className="text-gray-700">• {takeaway}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            {filteredSections.map((section, index) => (
              section.practice_questions?.length > 0 && (
                <div key={index} className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Practice Questions: {section.title}
                  </h3>
                  
                  <div className="space-y-4">
                    {section.practice_questions.map((question, qIndex) => (
                      <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2 mb-3">
                          <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                            {question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, oIndex) => (
                                  <label key={oIndex} className="flex items-center space-x-2">
                                    <input type="radio" name={`question-${qIndex}`} className="text-blue-600" />
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                            Show Answer
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded">
                            <p className="text-gray-700">{question.answer}</p>
                          </div>
                        </details>
                      </div>
                    ))}
<<<<<<< HEAD
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sections.length}</div>
                  <div className="text-sm text-gray-600">Sections</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {sections.reduce((total, section) => total + (section.practice_questions?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Practice Questions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {fusedNotes.total_estimated_study_time_minutes || 0}
                  </div>
                  <div className="text-sm text-gray-600">Study Time (min)</div>
                </div>
              </div>
            </div>
            
            {fusedNotes.summary && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Summary</h3>
                <div className="prose max-w-none">
                  <ReactMarkdown>{fusedNotes.summary}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

=======
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sections.length}</div>
                  <div className="text-sm text-gray-600">Sections</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {sections.reduce((total, section) => total + (section.practice_questions?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Practice Questions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {fusedNotes.total_estimated_study_time_minutes || 0}
                  </div>
                  <div className="text-sm text-gray-600">Study Time (min)</div>
                </div>
              </div>
            </div>
            
            {fusedNotes.summary && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Summary</h3>
                <div className="prose max-w-none">
                  <ReactMarkdown>{fusedNotes.summary}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
// --- Flashcard Flip Card ---
function Flashcard({ front, back, tags }) {
  const [flipped, setFlipped] = React.useState(false);
  return (
    <div
      className={`card p-4 cursor-pointer transition-transform duration-300 ${flipped ? 'bg-blue-50' : 'bg-white'}`}
      onClick={() => setFlipped(f => !f)}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
    >
      <div className="font-semibold text-lg mb-2">{flipped ? 'Answer' : 'Question'}</div>
      <div className="mb-3 text-gray-800 min-h-[60px]">{flipped ? back : front}</div>
      <div className="flex flex-wrap gap-1 mt-2">
        {tags && tags.map((tag, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{tag}</span>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-2">Click to flip</div>
    </div>
  );
}

// --- Quiz Display ---
function Quiz({ questions }) {
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
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <div key={idx} className="card p-4">
          <div className="font-medium mb-2">{q.question}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            {q.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                className={`px-3 py-2 rounded border transition-colors duration-200 ${
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
            <div className="text-sm mt-2">
              {answers[idx] === q.correct_answer ? (
                <span className="text-green-700">Correct!</span>
              ) : (
                <span className="text-red-700">Incorrect. Correct answer: <b>{q.options[q.correct_answer]}</b></span>
              )}
              <div className="text-gray-500 mt-1">{q.explanation}</div>
              <div className="text-xs text-gray-400 mt-1">Difficulty: {q.difficulty} | Topic: {q.topic_area}</div>
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-4 mt-4">
        {!showResults && (
          <button className="btn btn-primary" onClick={() => setShowResults(true)}>
            Submit Quiz
          </button>
        )}
        {showResults && (
          <div className="text-lg font-bold">Score: {score} / {questions.length}</div>
        )}
      </div>
    </div>
  );
}

export default SessionPage; 