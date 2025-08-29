import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

interface TooltipProps {
  /** The content to show in the tooltip */
  content: React.ReactNode;
  /** The trigger element */
  children: React.ReactElement;
  /** Position of the tooltip relative to the trigger */
  position?: 'top' | 'right' | 'bottom' | 'left';
  /** Alias for position (for compatibility with Radix UI) */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Additional class names */
  className?: string;
  /** Delay before showing the tooltip (ms) */
  delay?: number;
  /** Whether to show an arrow pointing to the trigger */
  showArrow?: boolean;
  /** Whether the tooltip is open (controlled mode) */
  open?: boolean;
  /** Callback when the open state changes */
  onOpenChange?: (open: boolean) => void;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position: positionProp = 'top',
  side,
  className = '',
  delay = 300,
  showArrow = true,
  open: controlledOpen,
  onOpenChange,
}) => {
  const position = side || positionProp;
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();
  const isControlled = typeof controlledOpen !== 'undefined';
  const isOpen = isControlled ? controlledOpen : isVisible;

  // Handle controlled vs uncontrolled state
  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setIsVisible(value);
    }
    onOpenChange?.(value);
  };

  // Position the tooltip relative to the trigger element
  const updatePosition = useCallback((): void => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    // Calculate positions based on tooltip position
    const positions = {
      top: {
        top: trigger.top + scrollY - tooltip.height - 8,
        left: trigger.left + scrollX + (trigger.width - tooltip.width) / 2,
      },
      right: {
        top: trigger.top + scrollY + (trigger.height - tooltip.height) / 2,
        left: trigger.left + scrollX + trigger.width + 8,
      },
      bottom: {
        top: trigger.bottom + scrollY + 8,
        left: trigger.left + scrollX + (trigger.width - tooltip.width) / 2,
      },
      left: {
        top: trigger.top + scrollY + (trigger.height - tooltip.height) / 2,
        left: trigger.left + scrollX - tooltip.width - 8,
      },
    };

    const { top: newTop, left: newLeft } = positions[position];
    
    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const left = Math.max(8, Math.min(viewportWidth - tooltip.width - 8, newLeft));
    const top = Math.max(8, Math.min(viewportHeight - tooltip.height - 8, newTop));

    setCoords({ top, left });
  }, [position]);

  // Handle hover events
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    timeoutRef.current = window.setTimeout(() => setOpen(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    timeoutRef.current = window.setTimeout(() => setOpen(false), 100);
  };

  // Update position when tooltip is open
  useEffect((): (() => void) | void => {
    if (!isOpen || !tooltipRef.current) return;
    
    updatePosition();
    
    // Set CSS variables for positioning
    tooltipRef.current.style.setProperty('--tooltip-top', `${coords.top}px`);
    tooltipRef.current.style.setProperty('--tooltip-left', `${coords.left}px`);
    
    // Re-position on scroll/resize
    const handleScroll = (): void => updatePosition();
    const handleResize = (): void => updatePosition();
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return (): void => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, updatePosition, coords.top, coords.left]);

  // Clean up timeouts on unmount
  useEffect((): (() => void) => {
    const id = timeoutRef.current;
    return (): void => {
      if (id) clearTimeout(id);
    };
  }, []);

  // Add keyboard event listeners for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Clone the child element to attach ref and event handlers
  const trigger = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      if (node) {
        // @ts-ignore - We know this is mutable
        triggerRef.current = node;
        const { ref } = children as any;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && 'current' in ref) {
          ref.current = node;
        }
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
      handleMouseLeave();
    },
    onFocus: (e: React.FocusEvent) => {
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
      handleMouseEnter();
    },
    onBlur: (e: React.FocusEvent) => {
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
      handleMouseLeave();
    },
    // Add ARIA attributes for accessibility
    'aria-describedby': isOpen ? 'tooltip-content' : undefined,
  });

  // Don't render anything if there's no content
  if (!content) {
    return children;
  }

  // Create the tooltip portal
  const tooltip = isOpen
    ? createPortal(
        <div
          ref={tooltipRef}
          className={`tooltip ${position} ${className}`}
          role="tooltip"
          id="tooltip-content"
        >
          {content}
          {showArrow && <div className="tooltip-arrow" />}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {trigger}
      {tooltip}
    </>
  );
};

export default Tooltip;
