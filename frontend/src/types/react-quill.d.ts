declare module 'react-quill' {
  import { Component, ComponentType } from 'react';
  
  interface ReactQuillProps {
    value?: string;
    defaultValue?: string;
    readOnly?: boolean;
    placeholder?: string;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    onChangeSelection?: (range: { index: number; length: number } | null, source: string, editor: any) => void;
    onFocus?: (range: { index: number; length: number } | null, source: string, editor: any) => void;
    onBlur?: (previousRange: { index: number; length: number } | null, source: string, editor: any) => void;
    onKeyPress?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
    style?: React.CSSProperties;
    className?: string;
    theme?: string;
    modules?: any;
    formats?: string[];
    children?: React.ReactNode;
    bounds?: string | HTMLElement;
    scrollingContainer?: string | HTMLElement;
    preserveWhitespace?: boolean;
  }

  const ReactQuill: ComponentType<ReactQuillProps>;
  
  export { ReactQuillProps };
  export default ReactQuill;
}
