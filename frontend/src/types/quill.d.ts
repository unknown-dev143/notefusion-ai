import 'quill';

declare module 'quill' {
  interface Quill {
    getSelection(focus?: boolean): { index: number; length: number } | null;
    insertEmbed(index: number, type: string, value: any, source?: string): void;
    setSelection(index: number, length: number, source?: string): void;
    updateContents(delta: any, source?: string): any;
    getLength(): number;
    getText(index?: number, length?: number): string;
  }
}
