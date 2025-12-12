declare module '@tinymce/tinymce-react' {
  import * as React from 'react';
  
  export interface IAllFormats {
    [key: string]: any;
  }
  
  export interface IProps {
    apiKey?: string;
    id?: string;
    inline?: boolean;
    initialValue?: string;
    init?: any;
    onEditorChange?: (content: string, editor: any) => void;
    value?: string;
    disabled?: boolean;
    tagName?: string;
    cloudChannel?: string;
    outputFormat?: 'html' | 'text';
    plugins?: string | string[];
    toolbar?: string | string[];
  }
  
  export class Editor extends React.Component<IProps> {}
  
  export function useEditor(id: string, settings?: any): any;
}
