import { useState } from 'react';
import { LayoutType } from '../types';

export function useGraphLayout(initialLayout: LayoutType = 'force') {
  const [layout, setLayout] = useState<LayoutType>(initialLayout);

  return {
    layout,
    setLayout,
  };
}