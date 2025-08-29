import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FaMagic, FaQuestion, FaKey, FaListUl } from 'react-icons/fa';
import { Button } from './ui/Button';
import Tooltip from './ui/Tooltip';
import { enhanceNote } from '../services/noteService';

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
    minContentLength: 1, // Allow single words
  },
  {
    type: 'questions',
    icon: <FaQuestion aria-hidden="true" />,
    label: 'Questions',
    tooltip: 'Generate study questions from your notes',
    minContentLength: 1, // Allow single words
  },
  {
    type: 'keypoints',
    icon: <FaKey aria-hidden="true" />,
    label: 'Key Points',
    tooltip: 'Extract key points from your notes',
    minContentLength: 1, // Allow single words
  },
  {
    type: 'outline',
    icon: <FaListUl aria-hidden="true" />,
    label: 'Outline',
    tooltip: 'Generate a structured outline from your notes',
    minContentLength: 1, // Allow single words
  },
] as const;

const DEFAULT_MAX_CONTENT_LENGTH = 10000;
const DEFAULT_MIN_CONTENT_LENGTH = 1; // Default to 1 character minimum

// Placeholder content is now handled by the noteService

export const NoteEnhancementPanel: React.FC<NoteEnhancementPanelProps> = ({
  content,
  onEnhance,
  disabled = false,
  className = '',
  maxContentLength = DEFAULT_MAX_CONTENT_LENGTH,
  // minContentLength is used in the component logic via ENHANCEMENT_BUTTONS
  minContentLength: _minContentLength = DEFAULT_MIN_CONTENT_LENGTH,
}) => {
  const [isLoading, setIsLoading] = useState<Record<EnhancementType, boolean>>(() => ({
    summary: false,
    questions: false,
    keypoints: false,
    outline: false,
  }));
  
  const [error, setError] = useState<string | null>(null);

  const validateContent = useCallback((content: string, minLength: number): boolean => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      setError('Please enter some text to enhance');
      return false;
    }
    
    if (trimmedContent.length < minLength) {
      setError(`Please enter at least ${minLength} character${minLength > 1 ? 's' : ''}`);
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
    async (type: EnhancementType) => {
      const trimmedContent = content.trim();
      
      if (!trimmedContent || disabled) {
        return;
      }

      const buttonConfig = ENHANCEMENT_BUTTONS.find(button => button.type === type);
      if (!buttonConfig) return;

      if (!validateContent(trimmedContent, buttonConfig.minContentLength)) {
        return;
      }

      setIsLoading(prev => ({ ...prev, [type]: true }));
      setError(null);

      try {
        // Use the noteService to generate enhanced content
        const result = await enhanceNote(trimmedContent, type);
        onEnhance(type, result);
      } catch (err: any) {
        console.error(`Error generating ${type}:`, err);
        const errorMessage = err?.message || `Failed to generate ${type}. Please try again later.`;
        setError(errorMessage);
      } finally {
        setIsLoading(prev => ({ ...prev, [type]: false }));
      }
    },
    [content, disabled, onEnhance, validateContent]
  );

  const renderButtons = useMemo(() => {
    return ENHANCEMENT_BUTTONS.map(({ type, icon, label, tooltip, minContentLength }) => {
      const isContentTooShort = content.length < minContentLength;
      const isButtonDisabled = disabled || isContentTooShort || isLoading[type];
      const buttonTooltip = isContentTooShort 
        ? `Content must be at least ${minContentLength} characters` 
        : tooltip;

      return (
        <Tooltip key={type} content={buttonTooltip}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEnhance(type)}
            disabled={isButtonDisabled}
            className={`flex items-center gap-2 ${isContentTooShort ? 'opacity-50' : ''}`}
            aria-label={`Enhance with ${label}`}
            aria-busy={isLoading[type] ? 'true' : 'false'}
            data-testid={`enhance-${type}-button`}
          >
            {isLoading[type] ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            ) : (
              icon
            )}
            <span className={isContentTooShort ? 'text-gray-500' : ''}>
              {label}
            </span>
          </Button>
        </Tooltip>
      );
    });
  }, [content, disabled, handleEnhance, isLoading]);

  const errorMessage = error && (
    <div 
      role="alert" 
      aria-live="assertive"
      className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-2 rounded"
    >
      <span role="img" aria-label="Error">⚠️</span>
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
        {renderButtons}
      </div>
      {errorMessage}
    </div>
  );
};
