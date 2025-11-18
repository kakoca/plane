/**
 * GraphCanvas Component
 * Wrapper principal do React Flow com configurações e funcionalidades padrão
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
  ReactFlowInstance,
  Connection,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
  BackgroundVariant,
  ProOptions,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphConfig,
  GraphNodeClickEvent,
  GraphEdgeClickEvent,
  GraphConnectionEvent,
  GraphChangeEvent,
} from '../types';
import { lightTheme, darkTheme, defaultGraphConfig } from '../theme';

// Empty objects defined outside to prevent recreation warning
// @see https://reactflow.dev/error#002
const EMPTY_NODE_TYPES = {};
const EMPTY_EDGE_TYPES = {};

interface GraphCanvasProps {
  // Data
  initialData?: GraphData;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  
  // Configuration
  config?: Partial<GraphConfig>;
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
  
  // Node types (will be implemented later)
  nodeTypes?: Record<string, React.ComponentType<any>>;
  edgeTypes?: Record<string, React.ComponentType<any>>;
  
  // Event handlers
  onNodeClick?: (event: GraphNodeClickEvent) => void;
  onNodeDoubleClick?: (event: GraphNodeClickEvent) => void;
  onNodeContextMenu?: (event: GraphNodeClickEvent) => void;
  onNodeDragStart?: (event: GraphNodeClickEvent) => void;
  onNodeDragStop?: (event: GraphNodeClickEvent) => void;
  
  onEdgeClick?: (event: GraphEdgeClickEvent) => void;
  onEdgeDoubleClick?: (event: GraphEdgeClickEvent) => void;
  onEdgeContextMenu?: (event: GraphEdgeClickEvent) => void;
  
  onConnect?: (connection: GraphConnectionEvent) => void;
  onDisconnect?: (edge: GraphEdge) => void;
  
  onChange?: (changes: GraphChangeEvent) => void;
  onInit?: (instance: ReactFlowInstance) => void;
  
  // Layout
  onLayoutChange?: (layout: string) => void;
  
  // Additional features
  enableClustering?: boolean;
  enableSelection?: boolean;
  enableKeyboardShortcuts?: boolean;
  proOptions?: ProOptions;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  initialData,
  nodes: controlledNodes,
  edges: controlledEdges,
  config = {},
  theme = 'light',
  className = '',
  style = {},
  nodeTypes = EMPTY_NODE_TYPES,
  edgeTypes = EMPTY_EDGE_TYPES,
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  onNodeDragStart,
  onNodeDragStop,
  onEdgeClick,
  onEdgeDoubleClick,
  onEdgeContextMenu,
  onConnect,
  onDisconnect,
  onChange,
  onInit,
  onLayoutChange,
  enableClustering = false,
  enableSelection = true,
  enableKeyboardShortcuts = true,
  proOptions,
}) => {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  
  // Merge config with defaults
  const mergedConfig = useMemo(
    () => ({ ...defaultGraphConfig, ...config }),
    [config]
  );
  
  // Get theme
  const currentTheme = useMemo(
    () => (theme === 'dark' ? darkTheme : lightTheme),
    [theme]
  );
  
  // Initialize nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(
    controlledNodes || initialData?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    controlledEdges || initialData?.edges || []
  );
  
  // Update nodes and edges when controlled props change
  useEffect(() => {
    if (controlledNodes) {
      setNodes(controlledNodes);
    }
  }, [controlledNodes, setNodes]);
  
  useEffect(() => {
    if (controlledEdges) {
      setEdges(controlledEdges);
    }
  }, [controlledEdges, setEdges]);
  
  // Handle node click
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick({
          node: node as GraphNode,
          event,
        });
      }
    },
    [onNodeClick]
  );
  
  // Handle node double click
  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeDoubleClick) {
        onNodeDoubleClick({
          node: node as GraphNode,
          event,
        });
      }
    },
    [onNodeDoubleClick]
  );
  
  // Handle node context menu
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (onNodeContextMenu) {
        onNodeContextMenu({
          node: node as GraphNode,
          event,
        });
      }
    },
    [onNodeContextMenu]
  );
  
  // Handle node drag start
  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeDragStart) {
        onNodeDragStart({
          node: node as GraphNode,
          event,
        });
      }
    },
    [onNodeDragStart]
  );
  
  // Handle node drag stop
  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeDragStop) {
        onNodeDragStop({
          node: node as GraphNode,
          event,
        });
      }
    },
    [onNodeDragStop]
  );
  
  // Handle edge click
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        onEdgeClick({
          edge: edge as GraphEdge,
          event,
        });
      }
    },
    [onEdgeClick]
  );
  
  // Handle edge double click
  const handleEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (onEdgeDoubleClick) {
        onEdgeDoubleClick({
          edge: edge as GraphEdge,
          event,
        });
      }
    },
    [onEdgeDoubleClick]
  );
  
  // Handle edge context menu
  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      if (onEdgeContextMenu) {
        onEdgeContextMenu({
          edge: edge as GraphEdge,
          event,
        });
      }
    },
    [onEdgeContextMenu]
  );
  
  // Handle connection
  const handleConnect = useCallback(
    (params: Connection) => {
      if (mergedConfig.enableEdgeCreation) {
        if (onConnect) {
          onConnect({
            source: params.source!,
            target: params.target!,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
          });
        } else {
          // Default behavior: add edge
          setEdges((eds) => addEdge(params, eds));
        }
      }
    },
    [mergedConfig.enableEdgeCreation, onConnect, setEdges]
  );
  
  // Handle nodes change
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (mergedConfig.enableNodeDrag || changes.some(c => c.type !== 'position')) {
        onNodesChange(changes);
        if (onChange) {
          onChange({
            nodes: applyNodeChanges(changes, nodes) as GraphNode[],
            edges: edges as GraphEdge[],
          });
        }
      }
    },
    [mergedConfig.enableNodeDrag, onNodesChange, onChange, nodes, edges]
  );
  
  // Handle edges change
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      if (onChange) {
        const updatedEdges = applyEdgeChanges(changes, edges);
        onChange({
          nodes: nodes as GraphNode[],
          edges: updatedEdges as GraphEdge[],
        });
      }
    },
    [onEdgesChange, onChange, nodes, edges]
  );
  
  // Handle init
  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
      if (onInit) {
        onInit(instance);
      }
      // Fit view on init
      if (mergedConfig.fitViewOptions) {
        setTimeout(() => {
          instance.fitView(mergedConfig.fitViewOptions);
        }, 0);
      }
    },
    [onInit, mergedConfig.fitViewOptions]
  );
  
  // Minimap node color
  const minimapNodeColor = useCallback(
    (node: Node) => {
      const nodeType = node.type || 'issue';
      return currentTheme.nodes[nodeType as keyof typeof currentTheme.nodes]?.backgroundColor || '#fff';
    },
    [currentTheme]
  );
  
  // Merge styles
  const mergedStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: currentTheme.background.backgroundColor,
    ...style,
  };
  
  return (
    <div className={`graph-canvas ${className}`} style={mergedStyle}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        onEdgeClick={handleEdgeClick}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        onEdgeContextMenu={handleEdgeContextMenu}
        onInit={handleInit}
        fitView={!!mergedConfig.fitViewOptions}
        fitViewOptions={mergedConfig.fitViewOptions}
        panOnDrag={mergedConfig.enablePanOnDrag}
        zoomOnScroll={mergedConfig.enableZoom}
        zoomOnPinch={mergedConfig.enableZoom}
        zoomOnDoubleClick={mergedConfig.enableZoom}
        nodesDraggable={mergedConfig.enableNodeDrag}
        nodesConnectable={mergedConfig.enableEdgeCreation}
        elementsSelectable={enableSelection}
        selectNodesOnDrag={enableSelection}
        minZoom={mergedConfig.minZoom}
        maxZoom={mergedConfig.maxZoom}
        proOptions={proOptions}
      >
        {mergedConfig.showBackground && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color={currentTheme.background.patternColor}
          />
        )}
        
        {mergedConfig.showControls && (
          <Controls />
        )}
        
        {mergedConfig.showMinimap && (
          <MiniMap
            nodeColor={minimapNodeColor}
            nodeStrokeWidth={3}
            pannable
            zoomable
            style={{
              backgroundColor: currentTheme.minimap.backgroundColor,
            }}
            maskColor={currentTheme.minimap.maskColor}
          />
        )}
      </ReactFlow>
    </div>
  );
};

// Export wrapped component with provider
const GraphCanvasWithProvider: React.FC<GraphCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default GraphCanvasWithProvider;