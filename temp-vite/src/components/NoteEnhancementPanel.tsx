import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FaMagic, FaQuestion, FaKey, FaListUl, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from './ui/Button';
import Tooltip from './ui/Tooltip';

type EnhancementType = 'summary' | 'questions' | 'keypoints' | 'outline';

interface NoteEnhancementPanelProps {
  content: string;
  onEnhance: (type: EnhancementType, content: string) => void;
  disabled?: boolean;
  className?: string;
  maxContentLength?: number;
  minContentLength?: number;
}

interface EnhancementButton {
  type: EnhancementType;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  minContentLength: number;
}

const ENHANCEMENT_BUTTONS: ReadonlyArray<EnhancementButton> = [
  {
    type: 'summary',
    icon: <FaMagic aria-hidden="true" />,
    label: 'Summary',
    tooltip: 'Generate a concise summary of your notes',
    minContentLength: 20,
  },
  {
    type: 'questions',
    icon: <FaQuestion aria-hidden="true" />,
    label: 'Questions',
    tooltip: 'Generate study questions from your notes',
    minContentLength: 30,
  },
  {
    type: 'keypoints',
    icon: <FaKey aria-hidden="true" />,
    label: 'Key Points',
    tooltip: 'Extract key points from your notes',
    minContentLength: 30,
  },
  {
    type: 'outline',
    icon: <FaListUl aria-hidden="true" />,
    label: 'Outline',
    tooltip: 'Generate a structured outline from your notes',
    minContentLength: 20,
  },
] as const;

const DEFAULT_MAX_CONTENT_LENGTH = 10000;
const DEFAULT_MIN_CONTENT_LENGTH = 10;

const generatePlaceholderContent = (type: EnhancementType): string => {
  const placeholders: Record<EnhancementType, string> = {
    summary: '## Summary\nThis is a generated summary of your notes.',
    questions: '## Study Questions\n1. What are the main points?\n2. How do these concepts connect?',
    keypoints: '## Key Points\n- Main idea 1\n- Main idea 2\n- Supporting detail',
    outline: '## Outline\n1. Main Topic\n   - Subtopic 1\n   - Subtopic 2\n2. Second Main Topic',
  };
  return placeholders[type];
};

export const NoteEnhancementPanel: React.FC<NoteEnhancementPanelProps> = ({
  content,
  onEnhance,
  disabled = false,
  className = '',
  maxContentLength = DEFAULT_MAX_CONTENT_LENGTH,
  minContentLength = DEFAULT_MIN_CONTENT_LENGTH,
}) => {
  const [isLoading, setIsLoading] = useState<Record<EnhancementType, boolean>>(() => ({
    summary: false,
    questions: false,
    keypoints: false,
    outline: false,
  }));
  
  const [error, setError] = useState<string | null>(null);

  const validateContent = useCallback((content: string, minLength: number): boolean => {
    // Clear any previous errors
    setError(null);
    
    if (!content.trim()) {
      setError('Content cannot be empty');
      return false;
    }
    
    if (content.length < minLength) {
      setError(`Content is too short. Minimum ${minLength} characters required.`);
      return false;
    }
    
    if (content.length > maxContentLength) {
      setError(`Content is too long. Maximum ${maxContentLength} characters allowed.`);
      return false;
    }
    
    return true;
  }, [maxContentLength]);
  
  // Clear error when content changes
  useEffect(() => {
    setError(null);
  }, [content]);

  const handleEnhance = useCallback(
    async (type: EnhancementType, minLength: number) => {
      const trimmedContent = content.trim();
      
      if (!trimmedContent || disabled) {
        return;
      }

      if (!validateContent(trimmedContent, minLength)) {
        return;
      }

      setIsLoading((prev) => ({ ...prev, [type]: true }));
      setError(null);

      try {
        // In a real implementation, you would call your AI service here
        // This simulates an API call with error handling
        const result = await new Promise<string>((resolve, reject) => {
          setTimeout(() => {
            try {
              // Simulate occasional failures (10% chance) for demonstration
              if (Math.random() < 0.1) {
                throw new Error('API request failed');
              }
              resolve(generatePlaceholderContent(type));
            } catch (err) {
              reject(err);
            }
          }, 1000);
        });

        onEnhance(type, result);
      } catch (err) {
        console.error(`Error generating ${type}:`, err);
        setError(`Failed to generate ${type}. Please try again later.`);
        // Consider adding error reporting here (e.g., Sentry, LogRocket)
      } finally {
        setIsLoading((prev) => ({ ...prev, [type]: false }));
      }
    },
    [content, disabled, onEnhance, validateContent]
  );

  const renderEnhancementButtons = useMemo(() => {
    return ENHANCEMENT_BUTTONS.map(({ type, label, icon, tooltip, minContentLength: minLength }) => {
      const isContentTooShort = content.length < minLength;
      const isDisabled = disabled || isContentTooShort || isLoading[type];
      
      const buttonTooltip = isContentTooShort 
        ? `Content must be at least ${minLength} characters` 
        : tooltip;
      
      return (
        <div key={type} className="relative">
          <Tooltip 
            content={buttonTooltip}
            position="top"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEnhance(type, minLength)}
              disabled={isDisabled}
              className={`flex items-center gap-1 transition-colors ${
                isContentTooShort ? 'opacity-50' : 'hover:bg-gray-100'
              }`}
              aria-label={`Generate ${label.toLowerCase()}`}
              aria-busy={isLoading[type]}
              data-testid={`enhance-${type}-button`}
            >
              <span 
                className={`${isLoading[type] ? 'animate-spin' : ''} ${
                  isContentTooShort ? 'text-gray-400' : 'text-current'
                }`} 
                aria-hidden="true"
              >
                {icon}
              </span>
              <span className={isContentTooShort ? 'text-gray-500' : ''}>
                {label}
              </span>
            </Button>
          </Tooltip>
        </div>
      );
    });
  }, [content.length, disabled, handleEnhance, isLoading]);

  const errorMessage = error && (
    <div 
      role="alert" 
      aria-live="assertive"
      className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded"
    >
      <FaExclamationTriangle className="flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div 
        className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
        role="toolbar"
        aria-label="Note enhancement options"
      >
        {renderEnhancementButtons}
      </div>
      {errorMessage}
    </div>
  );
};
