import { useState, useEffect } from 'react';
import { GraphData } from '../types';

export function useGraphData(initialData?: GraphData) {
  const [graphData, setGraphData] = useState<GraphData>(
    initialData || { nodes: [], edges: [] }
  );

  useEffect(() => {
    if (initialData) {
      setGraphData(initialData);
    }
  }, [initialData]);

  return {
    graphData,
    setGraphData,
  };
}