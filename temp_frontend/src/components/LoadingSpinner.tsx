import React from 'react';
import styled, { keyframes, css } from 'styled-components';

type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'custom';
type Size = 'small' | 'medium' | 'large';
type Variant = 'dots' | 'ring' | 'bars' | 'spinner';

interface LoadingSpinnerProps {
  theme?: Theme;
  size?: Size;
  variant?: Variant;
  message?: string;
  fullScreen?: boolean;
  customColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
}

const sizeMap = {
  small: '1.5rem',
  medium: '2.5rem',
  large: '4rem'
};

const themeColors = {
  light: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    background: 'rgba(255, 255, 255, 0.9)',
    text: '#1f2937'
  },
  dark: {
    primary: '#818cf8',
    secondary: '#a5b4fc',
    background: 'rgba(17, 24, 39, 0.95)',
    text: '#f9fafb'
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    background: 'rgba(239, 246, 255, 0.9)',
    text: '#1e40af'
  },
  green: {
    primary: '#10b981',
    secondary: '#34d399',
    background: 'rgba(236, 253, 245, 0.9)',
    text: '#065f46'
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    background: 'rgba(245, 243, 255, 0.9)',
    text: '#5b21b6'
  }
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const stretch = keyframes`
  0%, 40%, 100% { transform: scaleY(0.4); }  
  20% { transform: scaleY(1); }
`;

const LoadingContainer = styled.div<{ fullScreen: boolean; bgColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: ${({ fullScreen }) => (fullScreen ? '2rem' : '1rem')};
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 0.5rem;
  ${({ fullScreen }) =>
    fullScreen &&
    css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      backdrop-filter: blur(4px);
    `}
`;

const SpinnerBase = styled.div<{ size: string; primary: string; secondary: string }>`
  position: relative;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`;

const SpinnerRing = styled(SpinnerBase)`
  border: 4px solid ${({ secondary }) => secondary};
  border-radius: 50%;
  border-top: 4px solid ${({ primary }) => primary};
  animation: ${spin} 1s linear infinite;
`;

const SpinnerDots = styled(SpinnerBase)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  div {
    width: 20%;
    height: 20%;
    background-color: ${({ primary }) => primary};
    border-radius: 50%;
    display: inline-block;
    animation: ${bounce} 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
`;

const SpinnerBars = styled(SpinnerBase)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  div {
    background-color: ${({ primary }) => primary};
    height: 100%;
    width: 15%;
    display: inline-block;
    animation: ${stretch} 1.2s infinite ease-in-out;
    
    &:nth-child(2) { animation-delay: -1.1s; }
    &:nth-child(3) { animation-delay: -1.0s; }
    &:nth-child(4) { animation-delay: -0.9s; }
    &:nth-child(5) { animation-delay: -0.8s; }
  }
`;

const SpinnerClassic = styled(SpinnerBase)`
  border: 3px solid ${({ secondary }) => secondary};
  border-radius: 50%;
  border-top: 3px solid ${({ primary }) => primary};
  border-right: 3px solid ${({ primary }) => primary};
  border-bottom: 3px solid ${({ primary }) => primary};
  animation: ${spin} 0.8s linear infinite;
`;

const Message = styled.div<{ textColor: string }>`
  color: ${({ textColor }) => textColor};
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  max-width: 80%;
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  theme = 'light',
  size = 'medium',
  variant = 'spinner',
  message = 'Loading...',
  fullScreen = false,
  customColors
}) => {
  const colors = customColors || (theme === 'custom' ? {
    primary: '#3b82f6',
    secondary: '#93c5fd',
    background: 'rgba(255, 255, 255, 0.9)',
    text: '#1f2937'
  } : themeColors[theme]);

  const spinnerSize = sizeMap[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <SpinnerDots size={spinnerSize} primary={colors.primary} secondary={colors.secondary}>
            <div></div>
            <div></div>
            <div></div>
          </SpinnerDots>
        );
      case 'ring':
        return <SpinnerRing size={spinnerSize} primary={colors.primary} secondary={colors.secondary} />;
      case 'bars':
        return (
          <SpinnerBars size={spinnerSize} primary={colors.primary} secondary={colors.secondary}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </SpinnerBars>
        );
      case 'spinner':
      default:
        return <SpinnerClassic size={spinnerSize} primary={colors.primary} secondary={colors.secondary} />;
    }
  };

  return (
    <LoadingContainer fullScreen={fullScreen} bgColor={colors.background}>
      {renderSpinner()}
      {message && <Message textColor={colors.text}>{message}</Message>}
    </LoadingContainer>
  );
};

export default LoadingSpinner;
