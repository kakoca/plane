/**
 * PlaneDataAdapter
 * Converte dados do Plane para o formato GraphData usado pelo sistema de visualização de grafos
 */

import type {
  GraphNode,
  GraphEdge,
  GraphData,
  PlaneObjectType,
  RelationType,
  GraphNodeMetadata,
} from '@plane/graph-engine';

// Import Plane types (these would come from @plane/types)
interface PlaneIssue {
  id: string;
  name: string;
  sequence_id: string;
  state_id: string;
  state?: {
    id: string;
    name: string;
    color: string;
  };
  priority: string;
  assignee_ids: string[];
  assignees?: Array<{
    id: string;
    display_name: string;
    avatar?: string;
  }>;
  label_ids: string[];
  labels?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  parent_id?: string;
  sub_issues_count?: number;
  cycle_id?: string;
  module_ids?: string[];
  link_count?: number;
  attachment_count?: number;
  description_stripped?: string;
  created_at: string;
  updated_at: string;
  // Relations
  blocker_issues?: string[];
  blocked_issues?: string[];
  duplicate_issues?: string[];
  relates_to_issues?: string[];
}

interface PlaneCycle {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  owned_by_id: string;
  owner?: {
    id: string;
    display_name: string;
    avatar?: string;
  };
  progress?: number;
  total_issues?: number;
  completed_issues?: number;
  cancelled_issues?: number;
  started_issues?: number;
  unstarted_issues?: number;
  backlog_issues?: number;
  created_at: string;
  updated_at: string;
}

interface PlaneModule {
  id: string;
  name: string;
  description?: string;
  lead_id?: string;
  lead?: {
    id: string;
    display_name: string;
    avatar?: string;
  };
  member_ids?: string[];
  status?: string;
  start_date?: string;
  target_date?: string;
  total_issues?: number;
  completed_issues?: number;
  cancelled_issues?: number;
  started_issues?: number;
  unstarted_issues?: number;
  backlog_issues?: number;
  created_at: string;
  updated_at: string;
}

interface PlanePage {
  id: string;
  name: string;
  description?: string;
  content?: string;
  is_public: boolean;
  owned_by_id: string;
  owner?: {
    id: string;
    display_name: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
  // Linked pages or issues
  linked_pages?: string[];
  linked_issues?: string[];
}

interface PlaneView {
  id: string;
  name: string;
  description?: string;
  query?: Record<string, any>;
  display_filters?: Record<string, any>;
  display_properties?: Record<string, any>;
  owned_by_id: string;
  owner?: {
    id: string;
    display_name: string;
    avatar?: string;
  };
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

export class PlaneDataAdapter {
  private nodePositions: Map<string, { x: number; y: number }> = new Map();
  private layoutType: 'force' | 'hierarchical' | 'circular' | 'grid' = 'force';
  
  constructor(layoutType?: 'force' | 'hierarchical' | 'circular' | 'grid') {
    if (layoutType) {
      this.layoutType = layoutType;
    }
  }

  /**
   * Convert Plane issues to graph nodes
   */
  private issuesToNodes(issues: PlaneIssue[]): GraphNode[] {
    return issues.map((issue, index) => {
      const position = this.getNodePosition(issue.id, index);
      
      const metadata: GraphNodeMetadata = {
        title: issue.name,
        description: issue.description_stripped,
        status: issue.state?.name,
        priority: this.mapPriority(issue.priority),
        issueNumber: issue.sequence_id,
        stateId: issue.state_id,
        stateColor: issue.state?.color,
        assignee: issue.assignees?.[0] ? {
          id: issue.assignees[0].id,
          name: issue.assignees[0].display_name,
          avatar: issue.assignees[0].avatar,
        } : undefined,
        labels: issue.labels?.map(label => ({
          id: label.id,
          name: label.name,
          color: label.color,
        })),
      };

      return {
        id: issue.id,
        type: 'issue' as PlaneObjectType,
        data: {
          label: issue.name,
          metadata,
        },
        position,
        draggable: true,
        selectable: true,
        connectable: true,
        deletable: false,
      };
    });
  }

  /**
   * Convert Plane cycles to graph nodes
   */
  private cyclesToNodes(cycles: PlaneCycle[]): GraphNode[] {
    return cycles.map((cycle, index) => {
      const position = this.getNodePosition(cycle.id, index);
      
      const metadata: GraphNodeMetadata = {
        title: cycle.name,
        description: cycle.description,
        startDate: cycle.start_date,
        endDate: cycle.end_date,
        progress: cycle.progress || 0,
        completedIssues: cycle.completed_issues || 0,
        totalIssues: cycle.total_issues || 0,
        assignee: cycle.owner ? {
          id: cycle.owner.id,
          name: cycle.owner.display_name,
          avatar: cycle.owner.avatar,
        } : undefined,
      };

      return {
        id: cycle.id,
        type: 'cycle' as PlaneObjectType,
        data: {
          label: cycle.name,
          metadata,
        },
        position,
        draggable: true,
        selectable: true,
        connectable: true,
        deletable: false,
      };
    });
  }

  /**
   * Convert Plane modules to graph nodes
   */
  private modulesToNodes(modules: PlaneModule[]): GraphNode[] {
    return modules.map((module, index) => {
      const position = this.getNodePosition(module.id, index);
      
      const metadata: GraphNodeMetadata = {
        title: module.name,
        description: module.description,
        status: module.status,
        startDate: module.start_date,
        endDate: module.target_date,
        completedIssues: module.completed_issues || 0,
        totalIssues: module.total_issues || 0,
        assignee: module.lead ? {
          id: module.lead.id,
          name: module.lead.display_name,
          avatar: module.lead.avatar,
        } : undefined,
      };

      return {
        id: module.id,
        type: 'module' as PlaneObjectType,
        data: {
          label: module.name,
          metadata,
        },
        position,
        draggable: true,
        selectable: true,
        connectable: true,
        deletable: false,
      };
    });
  }

  /**
   * Convert Plane pages to graph nodes
   */
  private pagesToNodes(pages: PlanePage[]): GraphNode[] {
    return pages.map((page, index) => {
      const position = this.getNodePosition(page.id, index);
      
      const metadata: GraphNodeMetadata = {
        title: page.name,
        description: page.description,
        isPublic: page.is_public,
        lastUpdated: page.updated_at,
        assignee: page.owner ? {
          id: page.owner.id,
          name: page.owner.display_name,
          avatar: page.owner.avatar,
        } : undefined,
      };

      return {
        id: page.id,
        type: 'page' as PlaneObjectType,
        data: {
          label: page.name,
          metadata,
        },
        position,
        draggable: true,
        selectable: true,
        connectable: true,
        deletable: false,
      };
    });
  }

  /**
   * Convert Plane views to graph nodes
   */
  private viewsToNodes(views: PlaneView[]): GraphNode[] {
    return views.map((view, index) => {
      const position = this.getNodePosition(view.id, index);
      
      const metadata: GraphNodeMetadata = {
        title: view.name,
        description: view.description,
        queryParams: view.query,
        assignee: view.owner ? {
          id: view.owner.id,
          name: view.owner.display_name,
          avatar: view.owner.avatar,
        } : undefined,
      };

      return {
        id: view.id,
        type: 'view' as PlaneObjectType,
        data: {
          label: view.name,
          metadata,
        },
        position,
        draggable: true,
        selectable: true,
        connectable: true,
        deletable: false,
      };
    });
  }

  /**
   * Extract issue relationships and create edges
   */
  private extractIssueRelationships(issues: PlaneIssue[]): GraphEdge[] {
    const edges: GraphEdge[] = [];
    let edgeId = 0;

    issues.forEach(issue => {
      // Parent-child relationships
      if (issue.parent_id) {
        edges.push({
          id: `edge-${edgeId++}`,
          source: issue.parent_id,
          target: issue.id,
          type: 'parent_of' as RelationType,
          data: {
            animated: false,
          },
        });
      }

      // Blocker relationships
      issue.blocker_issues?.forEach(blockerId => {
        edges.push({
          id: `edge-${edgeId++}`,
          source: blockerId,
          target: issue.id,
          type: 'blocks' as RelationType,
          data: {
            animated: true,
          },
        });
      });

      // Blocked by relationships
      issue.blocked_issues?.forEach(blockedId => {
        edges.push({
          id: `edge-${edgeId++}`,
          source: issue.id,
          target: blockedId,
          type: 'blocks' as RelationType,
          data: {
            animated: true,
          },
        });
      });

      // Related issues
      issue.relates_to_issues?.forEach(relatedId => {
        edges.push({
          id: `edge-${edgeId++}`,
          source: issue.id,
          target: relatedId,
          type: 'references' as RelationType,
          data: {
            animated: false,
          },
        });
      });
    });

    return edges;
  }

  /**
   * Create edges between issues and cycles/modules
   */
  private createContainerEdges(
    issues: PlaneIssue[],
    cycles: PlaneCycle[],
    modules: PlaneModule[]
  ): GraphEdge[] {
    const edges: GraphEdge[] = [];
    let edgeId = 1000; // Start from 1000 to avoid conflicts

    issues.forEach(issue => {
      // Issue to cycle relationship
      if (issue.cycle_id) {
        edges.push({
          id: `edge-${edgeId++}`,
          source: issue.cycle_id,
          target: issue.id,
          type: 'belongs_to' as RelationType,
          data: {
            animated: false,
          },
        });
      }

      // Issue to module relationships
      issue.module_ids?.forEach(moduleId => {
        edges.push({
          id: `edge-${edgeId++}`,
          source: moduleId,
          target: issue.id,
          type: 'belongs_to' as RelationType,
          data: {
            animated: false,
          },
        });
      });
    });

    return edges;
  }

  /**
   * Create edges between pages
   */
  private createPageEdges(pages: PlanePage[]): GraphEdge[] {
    const edges: GraphEdge[] = [];
    let edgeId = 2000; // Start from 2000 to avoid conflicts

    pages.forEach(page => {
      // Page to page links
      page.linked_pages?.forEach(linkedPageId => {
        edges.push({
          id: `edge-${edgeId++}`,
          source: page.id,
          target: linkedPageId,
          type: 'links_to' as RelationType,
          data: {
            animated: false,
          },
        });
      });

      // Page to issue links
      page.linked_issues?.forEach(linkedIssueId => {
        edges.push({
          id: `edge-${edgeId++}`,
          source: page.id,
          target: linkedIssueId,
          type: 'references' as RelationType,
          data: {
            animated: false,
          },
        });
      });
    });

    return edges;
  }

  /**
   * Get node position based on layout type
   */
  private getNodePosition(nodeId: string, index: number): { x: number; y: number } {
    // Check if position is already cached
    if (this.nodePositions.has(nodeId)) {
      return this.nodePositions.get(nodeId)!;
    }

    let position: { x: number; y: number };

    switch (this.layoutType) {
      case 'grid':
        const cols = 5;
        const spacing = 300;
        position = {
          x: (index % cols) * spacing,
          y: Math.floor(index / cols) * spacing,
        };
        break;
      
      case 'circular':
        const radius = 400;
        const angle = (index * 2 * Math.PI) / 20; // Assume max 20 nodes for now
        position = {
          x: radius * Math.cos(angle) + 500,
          y: radius * Math.sin(angle) + 400,
        };
        break;
      
      case 'hierarchical':
        // Simple hierarchical layout (will be improved with actual hierarchy data)
        position = {
          x: 250 + (index % 3) * 300,
          y: 100 + Math.floor(index / 3) * 200,
        };
        break;
      
      case 'force':
      default:
        // Random initial positions for force layout
        position = {
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
        };
        break;
    }

    this.nodePositions.set(nodeId, position);
    return position;
  }

  /**
   * Map Plane priority to our priority type
   */
  private mapPriority(priority: string): 'urgent' | 'high' | 'medium' | 'low' | 'none' {
    const priorityMap: Record<string, 'urgent' | 'high' | 'medium' | 'low' | 'none'> = {
      'urgent': 'urgent',
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
      'none': 'none',
      'no-priority': 'none',
    };
    return priorityMap[priority] || 'none';
  }

  /**
   * Main conversion method - converts all Plane data to GraphData
   */
  public convertToGraphData(data: {
    issues?: PlaneIssue[];
    cycles?: PlaneCycle[];
    modules?: PlaneModule[];
    pages?: PlanePage[];
    views?: PlaneView[];
  }): GraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Convert all entity types to nodes
    if (data.issues) {
      nodes.push(...this.issuesToNodes(data.issues));
      edges.push(...this.extractIssueRelationships(data.issues));
    }

    if (data.cycles) {
      nodes.push(...this.cyclesToNodes(data.cycles));
    }

    if (data.modules) {
      nodes.push(...this.modulesToNodes(data.modules));
    }

    if (data.pages) {
      nodes.push(...this.pagesToNodes(data.pages));
      edges.push(...this.createPageEdges(data.pages));
    }

    if (data.views) {
      nodes.push(...this.viewsToNodes(data.views));
    }

    // Create container edges (issues to cycles/modules)
    if (data.issues && (data.cycles || data.modules)) {
      edges.push(...this.createContainerEdges(
        data.issues,
        data.cycles || [],
        data.modules || []
      ));
    }

    return {
      nodes,
      edges,
      layout: this.layoutType,
    };
  }

  /**
   * Set custom position for a node
   */
  public setNodePosition(nodeId: string, position: { x: number; y: number }): void {
    this.nodePositions.set(nodeId, position);
  }

  /**
   * Clear all cached positions
   */
  public clearPositions(): void {
    this.nodePositions.clear();
  }

  /**
   * Set layout type
   */
  public setLayoutType(type: 'force' | 'hierarchical' | 'circular' | 'grid'): void {
    this.layoutType = type;
    this.clearPositions(); // Clear positions when layout changes
  }
}

// Export a singleton instance for convenience
export const planeDataAdapter = new PlaneDataAdapter();

export default PlaneDataAdapter;