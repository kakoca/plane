import React, { useCallback, useMemo, useState } from "react";
import type {
  GraphConnectionEvent,
  GraphData,
  GraphEdge,
  GraphNode,
  GraphNodeClickEvent,
} from "@graph-engine/types";
import { observer } from "mobx-react";
import { GraphCanvas, useGraphData } from "@plane/graph-engine";
import { PlaneDataAdapter } from "../adapters/PlaneDataAdapter";
import type { PlaneIssue, PlaneModule } from "../adapters/PlaneDataAdapter";
import { NODE_TYPES } from "../constants/nodeTypes";

// Tipos
interface CycleGraphViewProps {
  workspaceSlug: string;
  projectId: string;
  cycleId: string;
  issues?: PlaneIssue[];
  modules?: PlaneModule[];
  onIssueClick?: (issueId: string) => void;
  onModuleClick?: (moduleId: string) => void;
  onRelationshipCreate?: (sourceId: string, targetId: string, type: string) => Promise<void>;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * CycleGraphView - Componente de visualização de grafos específico para ciclos
 *
 * Exibe issues relacionadas a um ciclo específico e suas conexões com módulos.
 * Permite visualizar:
 * - Issues do ciclo
 * - Relacionamentos entre issues (blocks, depends_on, parent_of)
 * - Conexões com módulos
 * - Criar novos relacionamentos via drag-and-drop
 *
 * @example
 * ```tsx
 * <CycleGraphView
 *   workspaceSlug="my-workspace"
 *   projectId="project-123"
 *   cycleId="cycle-456"
 *   issues={cycleIssues}
 *   onIssueClick={handleIssueClick}
 *   onRelationshipCreate={handleCreateRelation}
 * />
 * ```
 */
export const CycleGraphView: React.FC<CycleGraphViewProps> = observer(({
  workspaceSlug: _workspaceSlug,
  projectId: _projectId,
  cycleId: _cycleId,
  issues = [],
  modules = [],
  onIssueClick,
  onModuleClick,
  onRelationshipCreate,
  theme = "light",
  className = "",
}) => {
  type LayoutOption = "force" | "hierarchical" | "circular";
  const [layout, setLayout] = useState<LayoutOption>("hierarchical");
  const [selectedTypes, setSelectedTypes] = useState<Array<"issue" | "module">>(["issue", "module"]);

  // Criar adaptador e converter dados
  const adapter = useMemo(() => new PlaneDataAdapter(layout), [layout]);

  const initialGraphData = useMemo<GraphData>(
    () =>
      adapter.convertToGraphData({
        issues,
        modules,
        cycles: [],
        pages: [],
        views: [],
      }),
    [adapter, issues, modules]
  );

  // Gerenciamento de estado do grafo
  const { graphData, setGraphData } = useGraphData(initialGraphData) as {
    graphData: GraphData;
    setGraphData: (value: GraphData | ((prev: GraphData) => GraphData)) => void;
  };

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
  const handleNodeClick = useCallback((event: GraphNodeClickEvent) => {
    const { node } = event;

    if (node.type === "issue" && onIssueClick) {
      onIssueClick(node.id);
      return;
    }

    if (node.type === "module" && onModuleClick) {
      onModuleClick(node.id);
    }
  }, [onIssueClick, onModuleClick]);

  // Handler para criar conexões
  const handleConnect = useCallback(async (connection: GraphConnectionEvent) => {
    try {
      if (onRelationshipCreate) {
        await onRelationshipCreate(connection.source, connection.target, "depends_on");
      }

      const newEdge: GraphEdge = {
        id: `edge-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        type: "depends_on",
      };

      setGraphData((prev: GraphData) => ({
        ...prev,
        edges: [...prev.edges, newEdge],
      }));
    } catch (error) {
      console.error("[CycleGraphView] Error creating relationship:", error);
    }
  }, [onRelationshipCreate, setGraphData]);

  // Filtrar nodes por tipo selecionado
  const filteredNodes = useMemo(
    () => graphData.nodes.filter((node) => selectedTypes.includes(node.type as "issue" | "module")),
    [graphData.nodes, selectedTypes]
  );

  // Filtrar edges baseado nos nodes visíveis
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((node: GraphNode) => node.id));
    return graphData.edges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [graphData.edges, filteredNodes]);

  // Toggle de tipo de nó
  const toggleNodeType = useCallback((type: "issue" | "module") => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  }, []);

  return (
    <div className={`cycle-graph-view ${className}`} style={{ width: "100%", height: "100%" }}>
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
          Cycle View
        </span>

        {/* Layout selector */}
        <select
          value={layout}
          onChange={(event) => setLayout(event.target.value as LayoutOption)}
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
            onClick={() => toggleNodeType("module")}
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              border: `1px solid ${selectedTypes.includes("module") ? "#8b5cf6" : "#d1d5db"}`,
              background: selectedTypes.includes("module") ? "#8b5cf6" : "transparent",
              color: selectedTypes.includes("module") ? "#ffffff" : (theme === "dark" ? "#e5e7eb" : "#374151"),
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            Modules ({modules.length})
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      <GraphCanvas
        nodes={filteredNodes}
        edges={filteredEdges}
        nodeTypes={NODE_TYPES}
        onNodeClick={handleNodeClick}
        onConnect={handleConnect}
        config={config}
        theme={theme}
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

CycleGraphView.displayName = "CycleGraphView";