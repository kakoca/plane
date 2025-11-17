import { combine } from "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/combine.js";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/element/adapter.js";
import type {
  DropTargetEvent,
  DropTargetGetDataArgs,
} from "@atlaskit/pragmatic-drag-and-drop/dist/cjs/entry-point/element/adapter.js";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/cjs/closest-edge.js";
import type { ClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/dist/cjs/closest-edge.js";
import { isEqual } from "lodash-es";
import React, { useEffect, useRef, useState } from "react";
import { DropIndicator } from "../drop-indicator";
import { cn } from "../utils";

type SortableData = {
  __uuid__?: string;
  [key: string]: unknown;
};

type Props = {
  children: React.ReactNode;
  data: SortableData; //@todo make this generic
  className?: string;
};
type DropTargetArgs = DropTargetEvent<SortableData>;

const Draggable = ({ children, data, className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<boolean>(false); // NEW
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const [closestEdge, setClosestEdge] = useState<ClosestEdge | null>(null);
  useEffect(() => {
    const el = ref.current;

    if (el) {
      combine(
        draggable({
          element: el,
          onDragStart: () => setDragging(true), // NEW
          onDrop: () => setDragging(false), // NEW
          getInitialData: () => data,
        }),
        dropTargetForElements<SortableData>({
          element: el,
          onDragEnter: (args: DropTargetArgs) => {
            setIsDraggedOver(true);
            setClosestEdge(extractClosestEdge(args.self.data));
          },
          onDragLeave: () => setIsDraggedOver(false),
          onDrop: () => {
            setIsDraggedOver(false);
          },
          canDrop: ({ source }: DropTargetArgs) => {
            const sourceUuid = source.data.__uuid__;
            const targetUuid = data.__uuid__;
            if (!sourceUuid || !targetUuid) return false;
            return !isEqual(source.data, data) && sourceUuid === targetUuid;
          },
          getData: ({ input, element }: DropTargetGetDataArgs) =>
            attachClosestEdge(data, {
              input,
              element,
              allowedEdges: ["top", "bottom"],
            }),
        })
      );
    }
  }, [data]);

  return (
    <div ref={ref} className={cn(dragging && "opacity-25", className)}>
      {<DropIndicator isVisible={isDraggedOver && closestEdge === "top"} />}
      {children}
      {<DropIndicator isVisible={isDraggedOver && closestEdge === "bottom"} />}
    </div>
  );
};

export { Draggable };
