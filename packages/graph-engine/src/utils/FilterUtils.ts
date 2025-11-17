import { GraphNode, GraphEdge, GraphFilters, PlaneObjectType } from '../types';

class FilterUtils {
  static filterNodes(nodes: GraphNode[], filters: GraphFilters): GraphNode[] {
    let filtered = [...nodes];

    // Filter by types
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(node => 
        filters.types!.includes(node.type as PlaneObjectType)
      );
    }

    // Filter by statuses
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(node => 
        node.data.metadata.status && 
        filters.statuses!.includes(node.data.metadata.status)
      );
    }

    // Filter by priorities
    if (filters.priorities && filters.priorities.length > 0) {
      filtered = filtered.filter(node => 
        node.data.metadata.priority && 
        filters.priorities!.includes(node.data.metadata.priority)
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(node => 
        node.data.label.toLowerCase().includes(query) ||
        node.data.metadata.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  static filterEdges(edges: GraphEdge[], visibleNodeIds: Set<string>): GraphEdge[] {
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }
}

export default FilterUtils;