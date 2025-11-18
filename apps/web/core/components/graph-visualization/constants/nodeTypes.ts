/**
 * Shared NODE_TYPES constant for React Flow
 * Must be defined outside components to prevent recreation warnings
 * @see https://reactflow.dev/error#002
 */

import { 
  IssueNode, 
  CycleNode, 
  ModuleNode, 
  PageNode, 
  ViewNode 
} from '@plane/graph-engine';

// Define once, reuse everywhere - prevents React Flow warning about recreation
export const NODE_TYPES = {
  issue: IssueNode,
  cycle: CycleNode,
  module: ModuleNode,
  page: PageNode,
  view: ViewNode,
} as const;

// Empty object constants for default parameters (prevents recreation)
export const EMPTY_NODE_TYPES = {};
export const EMPTY_EDGE_TYPES = {};