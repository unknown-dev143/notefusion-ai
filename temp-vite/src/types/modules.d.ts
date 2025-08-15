// Type declarations for modules without type definitions
declare module 'react-router-dom' {
  export * from '@types/react-router-dom';
}

declare module '@tanstack/react-query-devtools' {
  import { ReactNode } from 'react';
  
  interface ReactQueryDevtoolsProps {
    initialIsOpen?: boolean;
    panelProps?: Record<string, any>;
    toggleButtonProps?: Record<string, any>;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }
  
  export function ReactQueryDevtools(props: ReactQueryDevtoolsProps): JSX.Element;
}

declare module 'antd' {
  export * from 'antd/es';
  export * from 'antd/lib';
}
