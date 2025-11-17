type DragInputEvent = MouseEvent | PointerEvent | TouchEvent;

type DropTargets<T> = Array<{ data: T }>;

declare module "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/combine.js" {
  export type CleanupFn = () => void;
  export function combine(...teardowns: Array<CleanupFn | undefined>): CleanupFn;
}

declare module "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/element/adapter.js" {
  export type DragSource<T = unknown> = { data: T };
  export type DropTarget<T = unknown> = { data: T };
  export type DropTargetEvent<T = unknown> = {
    source: DragSource<T>;
    self: DropTarget<T>;
  };
  export type DropTargetGetDataArgs = { input: DragInputEvent; element: HTMLElement };
  export type MonitorDropArgs<T = unknown> = {
    source: DragSource<T>;
    location: {
      current: {
        dropTargets: DropTargets<T>;
      } | null;
    } | null;
  };

  export function draggable<T = unknown>(options: {
    element: HTMLElement;
    getInitialData?: () => T;
    onDragStart?: (args: { source: DragSource<T> }) => void;
    onDrop?: (args: { source: DragSource<T> }) => void;
  }): () => void;

  export function dropTargetForElements<T = unknown>(options: {
    element: HTMLElement;
    onDragEnter?: (args: DropTargetEvent<T>) => void;
    onDragLeave?: (args: DropTargetEvent<T>) => void;
    onDrop?: (args: DropTargetEvent<T>) => void;
    canDrop?: (args: DropTargetEvent<T>) => boolean;
    getData?: (args: DropTargetGetDataArgs) => T;
  }): () => void;

  export function monitorForElements<T = unknown>(options: {
    onDrop: (args: MonitorDropArgs<T>) => void;
  }): () => void;
}

declare module "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/cjs/closest-edge.js" {
  import type { DropTargetGetDataArgs } from "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/element/adapter.js";

  export type ClosestEdge = "top" | "bottom" | "left" | "right";

  export function attachClosestEdge<T extends Record<string | symbol, unknown>>(
    data: T,
    options: DropTargetGetDataArgs & {
      allowedEdges?: ClosestEdge[];
    }
  ): T;

  export function extractClosestEdge(data: Record<string | symbol, unknown>): ClosestEdge | null;
}
