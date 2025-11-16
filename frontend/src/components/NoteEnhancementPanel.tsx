import { FC, useState, useCallback } from 'react';
import { FaMagic, FaQuestion, FaKey, FaListUl } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { Button } from './ui/Button';
import Tooltip from './ui/Tooltip';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
  }
}

type EnhancementType = 'summary' | 'questions' | 'keypoints' | 'outline' | 'no2' | 'no3' | 'no4' | 'no5';

interface NoteEnhancementPanelProps {
  content: string;
  onEnhance: (type: EnhancementType, content: string) => void;
  disabled?: boolean;
  className?: string;
  maxContentLength?: number;
  minContentLength?: number;
}

type IconProp = IconType | string;

interface EnhancementButton {
  type: EnhancementType;
  icon: IconProp;
  label: string;
  tooltip: string;
  minContentLength: number;
}

const ENHANCEMENT_BUTTONS: EnhancementButton[] = [
  {
    type: 'summary',
    icon: FaMagic,
    label: 'Summary',
    tooltip: 'Generate a concise summary of your notes',
    minContentLength: 50,
  },
  {
    type: 'questions',
    icon: FaQuestion,
    label: 'Questions',
    tooltip: 'Generate potential questions from your notes',
    minContentLength: 100,
  },
  {
    type: 'keypoints',
    icon: FaKey,
    label: 'Key Points',
    tooltip: 'Extract key points from your notes',
    minContentLength: 50,
  },
  {
    type: 'outline',
    icon: FaListUl,
    label: 'Outline',
    tooltip: 'Create an outline from your notes',
    minContentLength: 100,
  },
  {
    type: 'no2',
    icon: 'NO2',
    label: 'NO2',
    tooltip: 'NO2 enhancement',
    minContentLength: 10,
  },
  {
    type: 'no3',
    icon: 'NO3',
    label: 'NO3',
    tooltip: 'NO3 enhancement',
    minContentLength: 10,
  },
  {
    type: 'no4',
    icon: 'NO4',
    label: 'NO4',
    tooltip: 'NO4 enhancement',
    minContentLength: 10,
  },
  {
    type: 'no5',
    icon: 'NO5',
    label: 'NO5',
    tooltip: 'NO5 enhancement',
    minContentLength: 10,
  },
];

const DEFAULT_MAX_CONTENT_LENGTH = 10000;
const DEFAULT_MIN_CONTENT_LENGTH = 10;

const generatePlaceholderContent = (type: EnhancementType): string => {
  const placeholders: Record<EnhancementType, string> = {
    summary: '## Summary\nThis is a generated summary of your notes.',
    questions: '## Study Questions\n1. What are the main points?\n2. How do these concepts connect?',
    keypoints: '## Key Points\n- Main idea 1\n- Main idea 2\n- Supporting detail',
    outline: '## Outline\n1. Main Topic\n   - Subtopic 1\n   - Subtopic 2\n2. Second Main Topic',
    no2: 'NO2 Enhancement Content',
    no3: 'NO3 Enhancement Content',
    no4: 'NO4 Enhancement Content',
    no5: 'NO5 Enhancement Content',
  };
  return placeholders[type];
};

export const NoteEnhancementPanel: FC<NoteEnhancementPanelProps> = ({
  content,
  onEnhance,
  disabled = false,
  className = '',
  maxContentLength = DEFAULT_MAX_CONTENT_LENGTH,
  minContentLength = DEFAULT_MIN_CONTENT_LENGTH,
}) => {
  const [isLoading, setIsLoading] = useState<Record<EnhancementType, boolean>>({
    summary: false,
    questions: false,
    keypoints: false,
    outline: false,
    no2: false,
    no3: false,
    no4: false,
    no5: false,
  });
  
  const [error, setError] = useState<string | null>(null);

  const validateContent = useCallback((contentToValidate: string, minLength: number): boolean => {
    setError(null);
    
    if (!contentToValidate.trim()) {
      setError('Content cannot be empty');
      return false;
    }
    
    if (contentToValidate.length < minLength) {
      setError(`Content is too short. Minimum ${minLength} characters required.`);
      return false;
    }
    
    if (contentToValidate.length > maxContentLength) {
      setError(`Content is too long. Maximum ${maxContentLength} characters allowed.`);
      return false;
    }
    
    return true;
  }, [maxContentLength]);

  const handleEnhance = useCallback(async (type: EnhancementType) => {
    if (isLoading[type]) return;
    
    const trimmedContent = content.trim();
    
    const minLength = ENHANCEMENT_BUTTONS.find(button => button.type === type)?.minContentLength ?? 0;

    if (!validateContent(trimmedContent, minLength)) {
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, [type]: true }));
      
      // Simulate API call with placeholder content
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const enhancedContent = generatePlaceholderContent(type);
      onEnhance(type, enhancedContent);
    } catch (err) {
      const error = err as Error;
      setError(`Failed to generate ${type}. Please try again.`);
      console.error(`Error generating ${type}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [content, disabled, onEnhance, validateContent, isLoading]);

  const renderIcon = (icon: IconProp): React.ReactElement => {
    if (typeof icon === 'string') {
      return <span>{icon}</span>;
    }
    const Icon = icon;
    return <Icon className="h-4 w-4" aria-hidden="true" />;
  };

  const renderButtons = (): React.ReactElement[] => {
    return ENHANCEMENT_BUTTONS.map(({ type, label, icon, tooltip, minContentLength: minLength }) => {
      const isContentTooShort = content.length < minLength;
      const isButtonDisabled = disabled || isContentTooShort || isLoading[type];
      const buttonTooltip = isContentTooShort 
        ? `Content must be at least ${minLength} characters` 
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
              renderIcon(icon)
            )}
            <span className={isContentTooShort ? 'text-gray-500' : ''}>
              {label}
            </span>
          </Button>
        </Tooltip>
      );
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {renderButtons()}
      </div>
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
