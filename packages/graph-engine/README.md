# @plane/graph-engine

Motor de visualização de grafos para Plane, construído sobre React Flow.

## 📦 Instalação

```bash
pnpm add @plane/graph-engine
```

## 🚀 Uso Básico

```tsx
import { GraphCanvas, IssueNode, CycleNode } from '@plane/graph-engine';
import { GraphData } from '@plane/graph-engine/types';
import '@plane/graph-engine/dist/style.css';

const nodeTypes = {
  issue: IssueNode,
  cycle: CycleNode,
  // ... outros tipos
};

function MyGraphView() {
  const graphData: GraphData = {
    nodes: [
      {
        id: '1',
        type: 'issue',
        data: {
          label: 'Implementar feature X',
          metadata: {
            title: 'Implementar feature X',
            status: 'In Progress',
            priority: 'high',
            // ...
          },
        },
        position: { x: 250, y: 100 },
      },
    ],
    edges: [],
  };

  return (
    <GraphCanvas
      initialData={graphData}
      nodeTypes={nodeTypes}
      theme="light"
      config={{
        showMinimap: true,
        showControls: true,
        enableNodeDrag: true,
      }}
    />
  );
}
```

## 📚 Componentes

### GraphCanvas

Componente principal que envolve o React Flow com funcionalidades padrão.

**Props:**
- `initialData?: GraphData` - Dados iniciais do grafo
- `nodes?: GraphNode[]` - Nós controlados
- `edges?: GraphEdge[]` - Arestas controladas
- `config?: Partial<GraphConfig>` - Configuração
- `theme?: 'light' | 'dark'` - Tema
- `nodeTypes?: Record<string, ComponentType>` - Tipos de nós customizados
- `onNodeClick?: (event: GraphNodeClickEvent) => void` - Callback de clique em nó
- `onConnect?: (connection: GraphConnectionEvent) => void` - Callback de conexão

### Nós Customizados

- **IssueNode** - Para work items/issues
- **CycleNode** - Para sprints/cycles
- **ModuleNode** - Para módulos
- **PageNode** - Para páginas wiki
- **ViewNode** - Para visualizações

### Edges Customizados

- **BlocksEdge** - Para relações de bloqueio
- **DependsOnEdge** - Para dependências
- **ParentOfEdge** - Para relações hierárquicas
- **LinksToEdge** - Para links entre páginas

## 🎨 Temas

```tsx
import { getTheme, lightTheme, darkTheme } from '@plane/graph-engine/theme';

const theme = getTheme(isDarkMode);
```

## 🛠️ Utilitários

### GraphUtils

```tsx
import { GraphUtils } from '@plane/graph-engine';

// Encontrar nó
const node = GraphUtils.findNode(nodes, 'nodeId');

// Obter nós conectados
const connected = GraphUtils.getConnectedNodes('nodeId', edges);

// Mesclar dados de grafo
const merged = GraphUtils.mergeGraphData(data1, data2);
```

### LayoutUtils

```tsx
import { LayoutUtils } from '@plane/graph-engine';

// Layout em grade
const gridNodes = LayoutUtils.gridLayout(nodes, 5);

// Layout circular
const circularNodes = LayoutUtils.circularLayout(nodes, 400);

// Layout aleatório
const randomNodes = LayoutUtils.randomLayout(nodes, 1000, 800);
```

### FilterUtils

```tsx
import { FilterUtils } from '@plane/graph-engine';

const filters = {
  types: ['issue', 'cycle'],
  statuses: ['In Progress', 'Done'],
  priorities: ['high', 'urgent'],
};

const filteredNodes = FilterUtils.filterNodes(nodes, filters);
```

## 🪝 Hooks

### useGraphData

```tsx
import { useGraphData } from '@plane/graph-engine';

const { graphData, setGraphData } = useGraphData(initialData);
```

### useGraphFilters

```tsx
import { useGraphFilters } from '@plane/graph-engine';

const { filters, setFilters, updateFilter, clearFilters } = useGraphFilters();

// Atualizar filtro específico
updateFilter('types', ['issue', 'module']);

// Limpar todos os filtros
clearFilters();
```

### useGraphLayout

```tsx
import { useGraphLayout } from '@plane/graph-engine';

const { layout, setLayout } = useGraphLayout('force');

// Mudar layout
setLayout('hierarchical');
```

### useGraphInteractions

```tsx
import { useGraphInteractions } from '@plane/graph-engine';

const { handleNodeClick, handleEdgeClick, handleConnect } = useGraphInteractions({
  onNodeClick: (event) => console.log('Node clicked:', event.node),
  onEdgeClick: (event) => console.log('Edge clicked:', event.edge),
  onConnect: (connection) => console.log('Connected:', connection),
});
```

## 📖 Tipos

### GraphNode

```typescript
interface GraphNode {
  id: string;
  type: PlaneObjectType;
  data: {
    label: string;
    metadata: GraphNodeMetadata;
  };
  position: { x: number; y: number };
}
```

### GraphEdge

```typescript
interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  data?: {
    label?: string;
    metadata?: GraphEdgeMetadata;
  };
}
```

### GraphData

```typescript
interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout?: LayoutType;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}
```

## 🎯 Exemplos

### Visualização Básica com Filtros

```tsx
import { GraphCanvas, FilterUtils, useGraphFilters } from '@plane/graph-engine';

function FilteredGraphView({ data }) {
  const { filters, updateFilter } = useGraphFilters({
    types: ['issue'],
  });

  const filteredNodes = FilterUtils.filterNodes(data.nodes, filters);
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = FilterUtils.filterEdges(data.edges, visibleNodeIds);

  return (
    <div>
      <FilterPanel onFilterChange={updateFilter} />
      <GraphCanvas
        nodes={filteredNodes}
        edges={filteredEdges}
      />
    </div>
  );
}
```

### Grafo com Interações Customizadas

```tsx
import { GraphCanvas, useGraphInteractions } from '@plane/graph-engine';

function InteractiveGraph({ data, onIssueOpen }) {
  const { handleNodeClick, handleConnect } = useGraphInteractions({
    onNodeClick: (event) => {
      if (event.node.type === 'issue') {
        onIssueOpen(event.node.id);
      }
    },
    onConnect: async (connection) => {
      // Criar relação no backend
      await createRelationship({
        sourceId: connection.source,
        targetId: connection.target,
        type: 'depends_on',
      });
    },
  });

  return (
    <GraphCanvas
      initialData={data}
      onNodeClick={handleNodeClick}
      onConnect={handleConnect}
      config={{
        enableEdgeCreation: true,
      }}
    />
  );
}
```

## 🔧 Configuração

### GraphConfig

```typescript
interface GraphConfig {
  layout: LayoutType;
  showMinimap: boolean;
  showControls: boolean;
  showBackground: boolean;
  enablePanOnDrag: boolean;
  enableZoom: boolean;
  enableNodeDrag: boolean;
  enableEdgeCreation: boolean;
  maxZoom: number;
  minZoom: number;
  fitViewOptions?: {
    padding?: number;
    includeHiddenNodes?: boolean;
    minZoom?: number;
    maxZoom?: number;
    duration?: number;
  };
}
```

### Configuração Padrão

```typescript
import { defaultGraphConfig } from '@plane/graph-engine/theme';

const customConfig = {
  ...defaultGraphConfig,
  showMinimap: false,
  maxZoom: 3,
};
```

## 📝 Licença

AGPL-3.0

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o guia de contribuição do projeto Plane.