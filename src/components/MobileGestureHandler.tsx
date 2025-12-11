import React, { useRef, useEffect, useState } from 'react';
import './MobileGestureHandler.css';

interface SwipeData {
  direction: 'left' | 'right' | 'up' | 'down';
  velocity: number;
  distance: number;
}

interface MobileGestureHandlerProps {
  children: React.ReactNode;
  onSwipe?: (data: SwipeData) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => void;
  pullToRefreshThreshold?: number;
  className?: string;
}

const MobileGestureHandler: React.FC<MobileGestureHandlerProps> = ({
  children,
  onSwipe,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPullToRefresh,
  pullToRefreshThreshold = 80,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const minSwipeDistance = 50;
  const maxSwipeTime = 300;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });
      setTouchEnd(null);
      setPullDistance(0);
      setIsPulling(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.touches[0];
      const currentY = touch.clientY;
      const deltaY = currentY - touchStart.y;

      // Handle pull to refresh (only when at top of content)
      if (onPullToRefresh && deltaY > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(deltaY, pullToRefreshThreshold * 1.5));
        setIsPulling(true);
      }

      setTouchEnd({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) {
        setTouchStart(null);
        setTouchEnd(null);
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      const deltaX = touchEnd.x - touchStart.x;
      const deltaY = touchEnd.y - touchStart.y;
      const deltaTime = touchEnd.time - touchStart.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check if it's a valid swipe
      if (distance < minSwipeDistance || deltaTime > maxSwipeTime) {
        setTouchStart(null);
        setTouchEnd(null);
        setPullDistance(0);
        setIsPulling(false);
        return;
      }

      // Determine direction
      let direction: 'left' | 'right' | 'up' | 'down';
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const velocity = distance / deltaTime;
      const swipeData = { direction, velocity, distance };

      // Handle pull to refresh
      if (isPulling && pullDistance >= pullToRefreshThreshold) {
        onPullToRefresh?.();
      }
      // Handle regular swipes
      else {
        if (onSwipe) {
          onSwipe(swipeData);
        }

        if (direction === 'left' && onSwipeLeft) {
          onSwipeLeft();
        } else if (direction === 'right' && onSwipeRight) {
          onSwipeRight();
        } else if (direction === 'up' && onSwipeUp) {
          onSwipeUp();
        } else if (direction === 'down' && onSwipeDown) {
          onSwipeDown();
        }
      }

      // Reset state
      setTouchStart(null);
      setTouchEnd(null);
      setPullDistance(0);
      setIsPulling(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    touchStart,
    touchEnd,
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    pullToRefreshThreshold,
    pullDistance,
    isPulling,
  ]);

  return (
    <div
      ref={containerRef}
      className={`mobile-gesture-handler ${className}`}
      style={{
        touchAction: 'pan-y',
      }}
    >
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div
          className="pull-to-refresh-indicator"
          style={{
            transform: `translateY(${pullDistance}px)`,
            opacity: pullDistance / pullToRefreshThreshold,
          }}
        >
          <div className="pull-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: `rotate(${Math.min(pullDistance / pullToRefreshThreshold, 1) * 180}deg)`,
              }}
            >
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </div>
          <div className="pull-text">
            {pullDistance >= pullToRefreshThreshold ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default MobileGestureHandler;
