/**
 * Graph Theme System
 * Define estilos e cores para o sistema de visualização de grafos
 */

import type { GraphTheme } from '../types';

// Cores base do Plane (do design system)
const PLANE_COLORS = {
  // Primary
  primary: {
    DEFAULT: '#3f76ff',
    light: '#5e8fff',
    dark: '#2563eb',
  },
  
  // Status colors
  success: {
    DEFAULT: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    DEFAULT: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  danger: {
    DEFAULT: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  
  // Neutral colors
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Issue priority colors
  priority: {
    urgent: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#10b981',
    none: '#6b7280',
  },
  
  // State colors (status)
  state: {
    backlog: '#6b7280',
    unstarted: '#f59e0b',
    started: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
  },
};

export const lightTheme: GraphTheme = {
  nodes: {
    issue: {
      backgroundColor: '#ffffff',
      borderColor: PLANE_COLORS.gray[300],
      textColor: PLANE_COLORS.gray[900],
      iconColor: PLANE_COLORS.primary.DEFAULT,
    },
    cycle: {
      backgroundColor: '#f0f9ff',
      borderColor: '#60a5fa',
      textColor: PLANE_COLORS.gray[900],
      iconColor: '#3b82f6',
    },
    module: {
      backgroundColor: '#fef3c7',
      borderColor: '#fbbf24',
      textColor: PLANE_COLORS.gray[900],
      iconColor: '#f59e0b',
    },
    page: {
      backgroundColor: '#f3f4f6',
      borderColor: PLANE_COLORS.gray[400],
      textColor: PLANE_COLORS.gray[900],
      iconColor: PLANE_COLORS.gray[600],
    },
    view: {
      backgroundColor: '#ede9fe',
      borderColor: '#a78bfa',
      textColor: PLANE_COLORS.gray[900],
      iconColor: '#8b5cf6',
    },
  },
  edges: {
    blocks: {
      strokeColor: '#ef4444',
      strokeWidth: 2,
      strokeDasharray: undefined,
      markerColor: '#ef4444',
    },
    depends_on: {
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      markerColor: '#3b82f6',
    },
    parent_of: {
      strokeColor: '#10b981',
      strokeWidth: 2,
      strokeDasharray: undefined,
      markerColor: '#10b981',
    },
    links_to: {
      strokeColor: '#8b5cf6',
      strokeWidth: 1,
      strokeDasharray: '3,3',
      markerColor: '#8b5cf6',
    },
    belongs_to: {
      strokeColor: '#f59e0b',
      strokeWidth: 2,
      strokeDasharray: undefined,
      markerColor: '#f59e0b',
    },
    references: {
      strokeColor: '#6b7280',
      strokeWidth: 1,
      strokeDasharray: '2,2',
      markerColor: '#6b7280',
    },
  },
  background: {
    backgroundColor: '#fafafa',
    patternColor: '#e5e5e5',
  },
  minimap: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    maskColor: 'rgba(0, 0, 0, 0.2)',
    nodeColor: '#3f76ff',
  },
};

export const darkTheme: GraphTheme = {
  nodes: {
    issue: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textColor: '#f9fafb',
      iconColor: '#60a5fa',
    },
    cycle: {
      backgroundColor: '#1e3a8a',
      borderColor: '#2563eb',
      textColor: '#f9fafb',
      iconColor: '#60a5fa',
    },
    module: {
      backgroundColor: '#78350f',
      borderColor: '#92400e',
      textColor: '#f9fafb',
      iconColor: '#fbbf24',
    },
    page: {
      backgroundColor: '#111827',
      borderColor: '#1f2937',
      textColor: '#f9fafb',
      iconColor: '#9ca3af',
    },
    view: {
      backgroundColor: '#4c1d95',
      borderColor: '#5b21b6',
      textColor: '#f9fafb',
      iconColor: '#a78bfa',
    },
  },
  edges: {
    blocks: {
      strokeColor: '#f87171',
      strokeWidth: 2,
      strokeDasharray: undefined,
      markerColor: '#f87171',
    },
    depends_on: {
      strokeColor: '#60a5fa',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      markerColor: '#60a5fa',
    },
    parent_of: {
      strokeColor: '#34d399',
      strokeWidth: 2,
      strokeDasharray: undefined,
      markerColor: '#34d399',
    },
    links_to: {
      strokeColor: '#a78bfa',
      strokeWidth: 1,
      strokeDasharray: '3,3',
      markerColor: '#a78bfa',
    },
    belongs_to: {
      strokeColor: '#fbbf24',
      strokeWidth: 2,
      strokeDasharray: undefined,
      markerColor: '#fbbf24',
    },
    references: {
      strokeColor: '#9ca3af',
      strokeWidth: 1,
      strokeDasharray: '2,2',
      markerColor: '#9ca3af',
    },
  },
  background: {
    backgroundColor: '#0f172a',
    patternColor: '#1e293b',
  },
  minimap: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    maskColor: 'rgba(255, 255, 255, 0.1)',
    nodeColor: '#60a5fa',
  },
};

// Função helper para obter o tema baseado no modo atual
export const getTheme = (isDarkMode: boolean): GraphTheme => {
  return isDarkMode ? darkTheme : lightTheme;
};

// Função helper para obter a cor de prioridade
export const getPriorityColor = (priority: string): string => {
  return PLANE_COLORS.priority[priority as keyof typeof PLANE_COLORS.priority] || PLANE_COLORS.priority.none;
};

// Função helper para obter a cor de estado
export const getStateColor = (state: string): string => {
  return PLANE_COLORS.state[state as keyof typeof PLANE_COLORS.state] || PLANE_COLORS.state.backlog;
};

// Estilos base para nós
export const baseNodeStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '8px',
  borderWidth: '2px',
  borderStyle: 'solid',
  fontSize: '14px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: '200px',
};

// Estilos base para arestas
export const baseEdgeStyle: React.CSSProperties = {
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// Função para criar estilo de nó baseado no tipo e tema
export const createNodeStyle = (
  type: keyof GraphTheme['nodes'],
  theme: GraphTheme,
  additionalStyles?: React.CSSProperties
): React.CSSProperties => {
  const nodeTheme = theme.nodes[type];
  return {
    ...baseNodeStyle,
    backgroundColor: nodeTheme.backgroundColor,
    borderColor: nodeTheme.borderColor,
    color: nodeTheme.textColor,
    ...additionalStyles,
  };
};

// Função para criar estilo de aresta baseado no tipo e tema
export const createEdgeStyle = (
  type: keyof GraphTheme['edges'],
  theme: GraphTheme,
  additionalStyles?: React.CSSProperties
): React.CSSProperties => {
  const edgeTheme = theme.edges[type];
  return {
    ...baseEdgeStyle,
    stroke: edgeTheme.strokeColor,
    strokeWidth: edgeTheme.strokeWidth,
    strokeDasharray: edgeTheme.strokeDasharray,
    ...additionalStyles,
  };
};

// Configuração padrão do grafo
export const defaultGraphConfig = {
  layout: 'force' as const,
  showMinimap: true,
  showControls: true,
  showBackground: true,
  enablePanOnDrag: true,
  enableZoom: true,
  enableNodeDrag: true,
  enableEdgeCreation: true,
  maxZoom: 2,
  minZoom: 0.1,
  fitViewOptions: {
    padding: 0.2,
    includeHiddenNodes: false,
    minZoom: 0.1,
    maxZoom: 1,
    duration: 800,
  },
};

// Export cores para uso em outros componentes
export { PLANE_COLORS };

export default {
  lightTheme,
  darkTheme,
  getTheme,
  getPriorityColor,
  getStateColor,
  createNodeStyle,
  createEdgeStyle,
  defaultGraphConfig,
  PLANE_COLORS,
};