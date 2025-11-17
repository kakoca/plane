import React, { useMemo, useCallback, useState } from "react";
import { observer } from "mobx-react";
import {
  GraphCanvas,
  lightTheme,
  darkTheme,
  useGraphData,
  useGraphFilters,
} from "@plane/graph-engine";
import { PlaneDataAdapter } from "../adapters/PlaneDataAdapter";

// Tipos
interface ModuleGraphViewProps {
  workspaceSlug: string;
  projectId: string;
  moduleId: string;
  issues?: any[];
  cycles?: any[];
  onIssueClick?: (issueId: string) => void;
  onCycleClick?: (cycleId: string) => void;
  onRelationshipCreate?: (sourceId: string, targetId: string, type: string) => Promise<void>;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * ModuleGraphView - Componente de visualização de grafos específico para módulos
 * 
 * Exibe issues relacionadas a um módulo específico e suas conexões com ciclos.
 * Permite visualizar:
 * - Issues do módulo
 * - Relacionamentos entre issues (blocks, depends_on, parent_of)
 * - Conexões com ciclos
 * - Criar novos relacionamentos via drag-and-drop
 * 
 * @example
 * ```tsx
 * <ModuleGraphView
 *   workspaceSlug="my-workspace"
 *   projectId="project-123"
 *   moduleId="module-456"
 *   issues={moduleIssues}
 *   onIssueClick={handleIssueClick}
 *   onRelationshipCreate={handleCreateRelation}
 * />
 * ```
 */
export const ModuleGraphView: React.FC<ModuleGraphViewProps> = observer(({
  workspaceSlug,
  projectId,
  moduleId,
  issues = [],
  cycles = [],
  onIssueClick,
  onCycleClick,
  onRelationshipCreate,
  theme = "light",
  className = "",
}) => {
  const [layout, setLayout] = useState<"force" | "hierarchical" | "circular">("hierarchical");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["issue", "cycle"]);

  // Criar adaptador e converter dados
  const adapter = useMemo(() => new PlaneDataAdapter(layout), [layout]);
  
  const initialGraphData = useMemo(() => {
    // Focar apenas em dados do módulo
    return adapter.convertToGraphData({
      issues,
      cycles,
      modules: [], // Não mostrar outros módulos nesta view
      pages: [],
      views: [],
    });
  }, [adapter, issues, cycles]);

  // Gerenciamento de estado do grafo
  const { graphData, setGraphData } = useGraphData(initialGraphData);
  const { filters, updateFilter } = useGraphFilters();

  // Tema do grafo
  const graphTheme = theme === "dark" ? darkTheme : lightTheme;

  // Configuração do grafo
  const config = {
    fitView: true,
    showBackground: true,
    showControls: true,
    showMinimap: true,
    enablePanning: true,
    enableZoom: true,
    enableNodeDrag: true,
    enableEdgeInteraction: true,
  };

  // Handler para cliques em nós
  const handleNodeClick = useCallback((nodeId: string, nodeType: string) => {
    console.log(`[ModuleGraphView] Node clicked: ${nodeId} (${nodeType})`);
    
    switch (nodeType) {
      case "issue":
        onIssueClick?.(nodeId);
        break;
      case "cycle":
        onCycleClick?.(nodeId);
        break;
    }
  }, [onIssueClick, onCycleClick]);

  // Handler para criar conexões
  const handleConnect = useCallback(async (connection: { source: string; target: string }) => {
    console.log("[ModuleGraphView] Creating connection:", connection);
    
    try {
      // Criar relacionamento via API
      if (onRelationshipCreate) {
        await onRelationshipCreate(connection.source, connection.target, "depends_on");
      }

      // Adicionar edge ao grafo
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        type: "depends_on" as const,
      };

      setGraphData({
        ...graphData,
        edges: [...graphData.edges, newEdge],
      });
    } catch (error) {
      console.error("[ModuleGraphView] Error creating relationship:", error);
    }
  }, [graphData, setGraphData, onRelationshipCreate]);

  // Filtrar nodes por tipo selecionado
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter(node => selectedTypes.includes(node.type));
  }, [graphData.nodes, selectedTypes]);

  // Filtrar edges baseado nos nodes visíveis
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return graphData.edges.filter(
      edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [graphData.edges, filteredNodes]);

  // Toggle de tipo de nó
  const toggleNodeType = useCallback((type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  return (
    <div className={`module-graph-view ${className}`} style={{ width: "100%", height: "100%" }}>
      {/* Toolbar */}
      <div style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        padding: "8px 12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        gap: "8px",
        alignItems: "center",
      }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: theme === "dark" ? "#e5e7eb" : "#374151" }}>
          Module View
        </span>
        
        {/* Layout selector */}
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value as any)}
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            fontSize: "12px",
            background: theme === "dark" ? "#374151" : "#ffffff",
            color: theme === "dark" ? "#e5e7eb" : "#374151",
          }}
        >
          <option value="hierarchical">Hierarchical</option>
          <option value="force">Force</option>
          <option value="circular">Circular</option>
        </select>

        {/* Type filters */}
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => toggleNodeType("issue")}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: `1px solid ${selectedTypes.includes("issue") ? "#3b82f6" : "#d1d5db"}`,
              background: selectedTypes.includes("issue") ? "#3b82f6" : "transparent",
              color: selectedTypes.includes("issue") ? "#ffffff" : (theme === "dark" ? "#e5e7eb" : "#374151"),
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            Issues ({issues.length})
          </button>
          <button
            onClick={() => toggleNodeType("cycle")}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: `1px solid ${selectedTypes.includes("cycle") ? "#10b981" : "#d1d5db"}`,
              background: selectedTypes.includes("cycle") ? "#10b981" : "transparent",
              color: selectedTypes.includes("cycle") ? "#ffffff" : (theme === "dark" ? "#e5e7eb" : "#374151"),
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            Cycles ({cycles.length})
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      <GraphCanvas
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodeClick={handleNodeClick}
        onConnect={handleConnect}
        config={config}
        theme={graphTheme}
      />

      {/* Stats */}
      <div style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        zIndex: 10,
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        padding: "8px 12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontSize: "11px",
        color: theme === "dark" ? "#9ca3af" : "#6b7280",
      }}>
        {filteredNodes.length} nodes • {filteredEdges.length} edges
      </div>
    </div>
  );
});

ModuleGraphView.displayName = "ModuleGraphView";