declare module 'lodash/debounce' {
  interface DebounceSettings {
    leading?: boolean;
    maxWait?: number;
    trailing?: boolean;
  }

  interface Cancelable {
    cancel(): void;
    flush(): void;
  }

  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: DebounceSettings
  ): T & Cancelable;

  export = debounce;
}
