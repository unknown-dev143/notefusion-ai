import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Check, Sparkles } from 'lucide-react';

const OnboardingTour: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const steps = [
    {
      title: 'Welcome to NoteFusion AI',
      description: 'Your intelligent workspace for academic excellence. Let\'s take a quick tour of the key features.',
      icon: '🚀',
      action: null,
    },
    {
      title: 'Upload & Generate Notes',
      description: 'Upload PDFs, images, or documents. Our AI will automatically generate comprehensive study notes with tags and summaries.',
      icon: '📤',
      action: () => navigate('/upload'),
    },
    {
      title: 'Visualize in Graph View',
      description: 'See your knowledge connections in an interactive neural graph. Discover relationships between concepts you never knew existed.',
      icon: '💎',
      action: () => navigate('/graph'),
    },
    {
      title: 'Test Your Knowledge',
      description: 'Use the Testing Hub to run mock exams, stress tests, and synthesis quizzes. Failed questions automatically convert to study tasks.',
      icon: '🎯',
      action: () => navigate('/testing'),
    },
    {
      title: 'AI-Powered Synthesis',
      description: 'Deploy specialized AI agents in the AI Portal for research synthesis, Socratic tutoring, and concept explanation.',
      icon: '🌌',
      action: () => navigate('/ai-portal'),
    },
    {
      title: 'Quick Access Everywhere',
      description: 'Press ⌘K (or Ctrl+K) anytime to open the Command Palette for instant navigation and actions.',
      icon: '⚡',
      action: null,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (steps[currentStep + 1].action) {
        steps[currentStep + 1].action!();
      }
    } else {
      completeTour();
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg"></div>

      {/* Tour Card */}
      <div className="relative bg-white rounded-[48px] p-12 max-w-2xl w-full shadow-2xl animate-slide-up">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-8 right-8 w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all group"
        >
          <X size={20} className="text-slate-400 group-hover:text-slate-600"/>
        </button>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Step {currentStep + 1} of {steps.length}
            </p>
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
              {Math.round(progress)}% Complete
            </p>
          </div>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[28px] flex items-center justify-center text-5xl mb-8 shadow-lg">
          {step.icon}
        </div>

        {/* Content */}
        <h2 className="text-4xl font-black text-slate-900 mb-4 leading-tight">
          {step.title}
        </h2>
        <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-8 py-5 bg-slate-100 text-slate-700 rounded-[24px] font-black text-sm hover:bg-slate-200 transition-all"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check size={20}/>
                Get Started
              </>
            ) : (
              <>
                Next
                <ArrowRight size={20}/>
              </>
            )}
          </button>
        </div>

        {/* Skip Link */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={handleSkip}
            className="w-full text-center mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip Tour
          </button>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-20 -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-20 -ml-24 -mb-24 pointer-events-none"></div>
      </div>

      {/* Feature Highlights */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-white/20">
          <Sparkles size={16} className="text-blue-600"/>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
            Pro Tip: Use keyboard shortcuts for faster navigation
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingTour;
