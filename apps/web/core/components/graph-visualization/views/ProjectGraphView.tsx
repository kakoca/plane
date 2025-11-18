/**
 * ProjectGraphView
 * Componente principal para visualização de grafos de projetos
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GraphConnectionEvent,
  GraphData,
  GraphEdge,
  GraphFilters,
  GraphNode,
  GraphNodeClickEvent,
} from '@graph-engine/types';
import { observer } from 'mobx-react';
import {
  CycleNode,
  FilterUtils,
  GraphCanvas,
  IssueNode,
  ModuleNode,
  useGraphData,
  useGraphFilters,
} from '@plane/graph-engine';
import { PlaneDataAdapter } from '../adapters/PlaneDataAdapter';
import type { PlaneCycle, PlaneIssue, PlaneModule } from '../adapters/PlaneDataAdapter';

// Tipos de nós customizados - definidos fora do componente para evitar recriação
const NODE_TYPES = {
  issue: IssueNode,
  cycle: CycleNode,
  module: ModuleNode,
} as const;

interface ProjectGraphViewProps {
  projectId: string;
  workspaceSlug: string;
  // Dados mockados por enquanto - serão substituídos por chamadas de API
  issues?: PlaneIssue[];
  cycles?: PlaneCycle[];
  modules?: PlaneModule[];
  onIssueClick?: (issueId: string) => void;
  onCycleClick?: (cycleId: string) => void;
  onModuleClick?: (moduleId: string) => void;
  onRelationshipCreate?: (sourceId: string, targetId: string, type: string) => Promise<void>;
  theme?: 'light' | 'dark';
  className?: string;
}

export const ProjectGraphView: React.FC<ProjectGraphViewProps> = observer(({
  projectId: _projectId,
  workspaceSlug: _workspaceSlug,
  issues = [],
  cycles = [],
  modules = [],
  onIssueClick,
  onCycleClick,
  onModuleClick,
  onRelationshipCreate,
  theme = 'light',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [layout, setLayout] = useState<'force' | 'hierarchical' | 'circular' | 'grid'>('force');
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  // Inicializar adaptador
  const adapter = useMemo(() => new PlaneDataAdapter(layout), [layout]);

  // Converter dados do Plane para GraphData
  const initialGraphData = useMemo<GraphData>(() => {
    if (issues.length === 0 && cycles.length === 0 && modules.length === 0) {
      // Retornar dados mockados para demonstração
      return {
        nodes: [
          {
            id: 'issue-1',
            type: 'issue',
            data: {
              label: 'Implementar visualização de grafos',
              metadata: {
                title: 'Implementar visualização de grafos',
                description: 'Criar componente para visualização de relacionamentos',
                status: 'In Progress',
                priority: 'high',
                issueNumber: 'PLN-123',
                stateColor: '#3b82f6',
                assignee: {
                  id: 'user-1',
                  name: 'João Silva',
                },
                labels: [
                  { id: 'label-1', name: 'frontend', color: '#10b981' },
                  { id: 'label-2', name: 'enhancement', color: '#f59e0b' },
                ],
              },
            },
            position: { x: 250, y: 100 },
            draggable: true,
            selectable: true,
            connectable: true,
          },
          {
            id: 'issue-2',
            type: 'issue',
            data: {
              label: 'Criar adaptador de dados',
              metadata: {
                title: 'Criar adaptador de dados',
                status: 'Done',
                priority: 'medium',
                issueNumber: 'PLN-122',
                stateColor: '#10b981',
                assignee: {
                  id: 'user-2',
                  name: 'Maria Santos',
                },
                labels: [
                  { id: 'label-1', name: 'backend', color: '#8b5cf6' },
                ],
              },
            },
            position: { x: 250, y: 300 },
            draggable: true,
            selectable: true,
            connectable: true,
          },
          {
            id: 'cycle-1',
            type: 'cycle',
            data: {
              label: 'Sprint 15',
              metadata: {
                title: 'Sprint 15',
                description: 'Q1 2025 - Graph Visualization',
                startDate: '2025-01-01',
                endDate: '2025-01-15',
                progress: 65,
                completedIssues: 13,
                totalIssues: 20,
              },
            },
            position: { x: 600, y: 200 },
            draggable: true,
            selectable: true,
            connectable: true,
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'issue-2',
            target: 'issue-1',
            type: 'depends_on',
            data: {
              animated: true,
            },
          },
          {
            id: 'edge-2',
            source: 'cycle-1',
            target: 'issue-1',
            type: 'belongs_to',
          },
          {
            id: 'edge-3',
            source: 'cycle-1',
            target: 'issue-2',
            type: 'belongs_to',
          },
        ],
        layout,
      };
    }

    return adapter.convertToGraphData({
      issues,
      cycles,
      modules,
    });
  }, [issues, cycles, modules, layout, adapter]);

  const { graphData, setGraphData } = useGraphData(initialGraphData) as {
    graphData: GraphData;
    setGraphData: (value: GraphData | ((prev: GraphData) => GraphData)) => void;
  };
  const { filters, updateFilter, clearFilters } = useGraphFilters({
    types: ['issue', 'cycle', 'module'],
  }) as {
    filters: GraphFilters;
    updateFilter: (key: keyof GraphFilters, value: GraphFilters[keyof GraphFilters]) => void;
    clearFilters: () => void;
  };

  // Aplicar filtros
  const filteredData = useMemo(() => {
    const filteredNodes = FilterUtils.filterNodes(graphData.nodes, filters) as GraphNode[];
    const visibleNodeIds = new Set(filteredNodes.map((node) => node.id));
    const filteredEdges = FilterUtils.filterEdges(graphData.edges, visibleNodeIds);

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [graphData, filters]);

  // Handler para clique em nó
  const handleNodeClick = useCallback((event: GraphNodeClickEvent) => {
    const { node } = event;

    if (node.type === 'issue' && onIssueClick) {
      onIssueClick(node.id);
      return;
    }

    if (node.type === 'cycle' && onCycleClick) {
      onCycleClick(node.id);
      return;
    }

    if (node.type === 'module' && onModuleClick) {
      onModuleClick(node.id);
    }
  }, [onIssueClick, onCycleClick, onModuleClick]);

  // Handler para criar conexão
  const handleConnect = useCallback(async (connection: GraphConnectionEvent) => {
    if (onRelationshipCreate) {
      try {
        setIsLoading(true);
        await onRelationshipCreate(
          connection.source,
          connection.target,
          'depends_on'
        );

        // Adicionar aresta ao grafo
        const newEdge: GraphEdge = {
          id: `edge-${Date.now()}`,
          source: connection.source,
          target: connection.target,
          type: 'depends_on' as const,
          data: {
            animated: true,
          },
        };

        setGraphData((prev: GraphData) => ({
          ...prev,
          edges: [...prev.edges, newEdge],
        }));
      } catch (error) {
        console.error('Failed to create relationship:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [onRelationshipCreate, setGraphData]);

  // Handler para mudança de layout
  const handleLayoutChange = useCallback((newLayout: typeof layout) => {
    setLayout(newLayout);
    adapter.setLayoutType(newLayout);
  }, [adapter]);

  return (
    <div className={`project-graph-view ${className}`} style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#ffffff',
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          Project Graph View
        </h2>

        {/* Layout selector */}
        <select
          value={layout}
          onChange={(e) => handleLayoutChange(e.target.value as typeof layout)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
          }}
        >
          <option value="force">Force</option>
          <option value="hierarchical">Hierarchical</option>
          <option value="circular">Circular</option>
          <option value="grid">Grid</option>
        </select>

        {/* Filter by type */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={filters.types?.includes('issue')}
              onChange={(e) => {
                const types = filters.types || [];
                updateFilter('types',
                  e.target.checked
                    ? [...types, 'issue']
                    : types.filter((type) => type !== 'issue')
                );
              }}
            />
            Issues
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={filters.types?.includes('cycle')}
              onChange={(e) => {
                const types = filters.types || [];
                updateFilter('types',
                  e.target.checked
                    ? [...types, 'cycle']
                    : types.filter((type) => type !== 'cycle')
                );
              }}
            />
            Cycles
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={filters.types?.includes('module')}
              onChange={(e) => {
                const types = filters.types || [];
                updateFilter('types',
                  e.target.checked
                    ? [...types, 'module']
                    : types.filter((type) => type !== 'module')
                );
              }}
            />
            Modules
          </label>

          {(filters.types?.length || 0) < 3 && (
            <button
              onClick={clearFilters}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Graph Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
            Loading...
          </div>
        )}

        <GraphCanvas
          nodes={filteredData.nodes}
          edges={filteredData.edges}
          nodeTypes={NODE_TYPES}
          theme={isDarkMode ? 'dark' : 'light'}
          config={{
            showMinimap: true,
            showControls: true,
            showBackground: true,
            enableNodeDrag: true,
            enableEdgeCreation: true,
            enableZoom: true,
            fitViewOptions: {
              padding: 0.2,
              duration: 800,
            },
          }}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
        />
      </div>
    </div>
  );
});

ProjectGraphView.displayName = 'ProjectGraphView';

export default ProjectGraphView;