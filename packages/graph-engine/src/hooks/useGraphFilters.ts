import { useState } from 'react';
import { GraphFilters } from '../types';

export function useGraphFilters(initialFilters?: GraphFilters) {
  const [filters, setFilters] = useState<GraphFilters>(initialFilters || {});

  const updateFilter = (key: keyof GraphFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
  };
}