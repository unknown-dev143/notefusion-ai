import { FC, useState, useCallback, ReactNode } from 'react';
import { FaMagic, FaQuestion, FaKey, FaListUl } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/Tooltip';

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
];

const DEFAULT_MAX_CONTENT_LENGTH = 10000;
const DEFAULT_MIN_CONTENT_LENGTH = 10;

const generatePlaceholderContent = (type: EnhancementType): string => {
  const placeholders: Record<EnhancementType, string> = {
    summary: '## Summary\nThis is a generated summary of your notes.',
    questions: '## Study Questions\n1. What are the main points?\n2. How do these concepts connect?',
    keypoints: '## Key Points\n- Main idea 1\n- Main idea 2\n- Supporting detail',
    outline: '## Outline\n1. Main Topic\n   - Subtopic 1\n   - Subtopic 2\n2. Second Main Topic',
    no2: 'NO2 enhancement',
    no3: 'NO3 enhancement',
    no4: 'NO4 enhancement',
    no5: 'NO5 enhancement',
  };
  return placeholders[type] || 'Content';
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
    if (disabled || isLoading[type]) return;
    
    const trimmedContent = content.trim();
    const buttonConfig = ENHANCEMENT_BUTTONS.find(btn => btn.type === type);
    const minLength = buttonConfig?.minContentLength ?? minContentLength;

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
  }, [content, disabled, isLoading, minContentLength, onEnhance, validateContent]);

  const renderButton = (button: EnhancementButton) => {
    const Icon = button.icon as IconType;
    const isButtonDisabled = disabled || isLoading[button.type];
    
    return (
      <TooltipProvider key={button.type}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEnhance(button.type)}
              disabled={isButtonDisabled}
              loading={isLoading[button.type]}
              className="flex items-center gap-2"
            >
              {typeof Icon === 'function' ? <Icon /> : button.label}
              <span className="sr-only">{button.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {button.tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {ENHANCEMENT_BUTTONS.map(renderButton)}
      {error && (
        <div className="text-red-500 text-sm mt-2 w-full">
          {error}
        </div>
      )}
    </div>
  );
};
