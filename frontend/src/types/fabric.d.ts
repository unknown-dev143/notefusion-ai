declare module 'fabric' {
  export namespace fabric {
    export class Canvas {
      constructor(element: HTMLCanvasElement | string, options?: any);
      width: number;
      height: number;
      backgroundColor: string;
      isDrawingMode: boolean;
      freeDrawingBrush: any;
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
      forEachObject(callback: (obj: any) => void): void;
      defaultCursor: string;
      selection: boolean;
      setWidth(width: number): void;
      setHeight(height: number): void;
    }

    export class Object {
      left: number;
      top: number;
      fill: string;
      stroke: string;
      strokeWidth: number;
      selectable: boolean;
    }

    export class Rect extends Object {
      constructor(options?: any);
      width: number;
      height: number;
    }

    export class Circle extends Object {
      constructor(options?: any);
      radius: number;
    }

    export class Line extends Object {
      constructor(points: number[], options?: any);
    }

    export class IText extends Object {
      constructor(text: string, options?: any);
      fontSize: number;
      fontFamily: string;
    }

    export class Group extends Object {
      constructor(objects: any[], options?: any);
    }

    export class EraserBrush {
      constructor(canvas: Canvas);
      width: number;
    }
  }

  export type Canvas = fabric.Canvas;
  export type Rect = fabric.Rect;
  export type Circle = fabric.Circle;
  export type Line = fabric.Line;
  export type IText = fabric.IText;
  export type Group = fabric.Group;
  export type Object = fabric.Object;
  export type EraserBrush = fabric.EraserBrush;

  export const Canvas: typeof fabric.Canvas;
  export const Rect: typeof fabric.Rect;
  export const Circle: typeof fabric.Circle;
  export const Line: typeof fabric.Line;
  export const IText: typeof fabric.IText;
  export const Group: typeof fabric.Group;
  export const Object: typeof fabric.Object;
  export const EraserBrush: typeof fabric.EraserBrush;
}
