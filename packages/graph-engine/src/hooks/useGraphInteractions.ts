import { useCallback } from 'react';
import { GraphNodeClickEvent, GraphEdgeClickEvent, GraphConnectionEvent } from '../types';

export function useGraphInteractions(handlers?: {
  onNodeClick?: (event: GraphNodeClickEvent) => void;
  onEdgeClick?: (event: GraphEdgeClickEvent) => void;
  onConnect?: (event: GraphConnectionEvent) => void;
}) {
  const handleNodeClick = useCallback((event: GraphNodeClickEvent) => {
    handlers?.onNodeClick?.(event);
  }, [handlers]);

  const handleEdgeClick = useCallback((event: GraphEdgeClickEvent) => {
    handlers?.onEdgeClick?.(event);
  }, [handlers]);

  const handleConnect = useCallback((event: GraphConnectionEvent) => {
    handlers?.onConnect?.(event);
  }, [handlers]);

  return {
    handleNodeClick,
    handleEdgeClick,
    handleConnect,
  };
}