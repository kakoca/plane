import { GraphNode, GraphEdge, GraphData } from '../types';

class GraphUtils {
  static findNode(nodes: GraphNode[], id: string): GraphNode | undefined {
    return nodes.find(node => node.id === id);
  }

  static findEdge(edges: GraphEdge[], id: string): GraphEdge | undefined {
    return edges.find(edge => edge.id === id);
  }

  static getConnectedNodes(nodeId: string, edges: GraphEdge[]): string[] {
    const connected: string[] = [];
    edges.forEach(edge => {
      if (edge.source === nodeId) connected.push(edge.target);
      if (edge.target === nodeId) connected.push(edge.source);
    });
    return [...new Set(connected)];
  }

  static mergeGraphData(data1: GraphData, data2: GraphData): GraphData {
    return {
      nodes: [...data1.nodes, ...data2.nodes],
      edges: [...data1.edges, ...data2.edges],
      layout: data1.layout || data2.layout,
    };
  }
}

export default GraphUtils;