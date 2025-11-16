declare module 'fabric' {
  export class Canvas {
    constructor(element: HTMLCanvasElement | string, options?: any);
    width: number;
    height: number;
    backgroundColor: string;
    isDrawingMode: boolean;
    freeDrawingBrush: {
      width: number;
      color: string;
    };
    on(event: string, handler: (e: any) => void): void;
    off(event: string, handler: (e: any) => void): void;
    add(...objects: any[]): void;
    remove(...objects: any[]): void;
    clear(): void;
    renderAll(): void;
    toJSON(propertiesToInclude?: string[]): any;
    loadFromJSON(json: string | any, callback: () => void): void;
    toDataURL(options?: { format?: string; quality?: number }): string;
    getPointer(e: MouseEvent | TouchEvent): { x: number; y: number };
    setActiveObject(obj: any): void;
    getActiveObject(): any;
    dispose(): void;
  }

  export class Rect {
    constructor(options?: any);
    left: number;
    top: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  }

  export class Circle {
    constructor(options?: any);
    left: number;
    top: number;
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  }

  export class Line {
    constructor(points: number[], options?: any);
    stroke: string;
    strokeWidth: number;
  }

  export class IText {
    constructor(text: string, options?: any);
    left: number;
    top: number;
    fontSize: number;
    fontFamily: string;
    fill: string;
  }

  export class Group {
    constructor(objects: any[], options?: any);
  }
}

