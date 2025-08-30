declare module 'react-hotkeys-hook' {
  import { RefObject } from 'react';

  type KeyMap = {
    [key: string]: string | string[];
  };

  type Options = {
    filter?: (event: KeyboardEvent) => boolean;
    filterPreventDefault?: boolean;
    enableOnTags?: string[];
    enabled?: boolean;
    enableOnContentEditable?: boolean;
    keyup?: boolean;
    keydown?: boolean;
    splitKey?: string;
    scope?: string;
    target?: Window | Document | HTMLElement | RefObject<HTMLElement> | null;
    event?: 'keydown' | 'keyup' | 'keypress';
    exactOnMatch?: boolean;
    description?: string;
    document?: Document;
    ignoreModifiers?: boolean;
    ignoreModifierKeys?: boolean;
    ignoreRepeatedEventsWhenKeyHeldDown?: boolean;
  };

  type Callback = (event: KeyboardEvent) => void;

  export function useHotkeys<T extends Element>(
    keys: string,
    callback: Callback,
    options?: Options,
    dependencies?: any[]
  ): void;

  export function useHotkeys<T extends Element>(
    keys: string,
    callback: Callback,
    deps?: any[]
  ): void;

  export function useHotkeys<T extends Element>(
    keys: string,
    callback: Callback,
    options: Options,
    deps: any[]
  ): void;

  export function useIsHotkeyPressed(): (key: string) => boolean;
  
  export function Hotkeys(
    props: {
      keyName: string;
      onKeyUp?: (keyEvent: KeyboardEvent) => void;
      onKeyDown?: (keyEvent: KeyboardEvent) => void;
      allowRepeat?: boolean;
      filter?: (event: KeyboardEvent) => boolean;
      disabled?: boolean;
      description?: string;
      children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLElement>
  ): JSX.Element;

  export function HotkeysProvider(
    props: {
      keyMap?: KeyMap;
      children: React.ReactNode;
    } & React.HTMLAttributes<HTMLElement>
  ): JSX.Element;
}
